const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const News = require('../models/News');
const NewsSource = require('../models/NewsSource');
const CrawlTask = require('../models/CrawlTask');
const { analyzeSentiment, calculateHeatIndex } = require('../services/sentimentService');

const defaultSelectors = {
  listItem: 'item',
  title: 'title',
  content: 'description',
  publishTime: 'pubDate',
  author: 'author, creator'
};

class NewsCrawler {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async fetchPage(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const html = await page.content();
      return html;
    } finally {
      await page.close();
    }
  }

  parseListPage(html, selectors, sourceType) {
    const $ = cheerio.load(html, { xmlMode: sourceType === 'rss' });
    const listSelector = selectors?.listItem || defaultSelectors.listItem;
    const titleSelector = selectors?.title || defaultSelectors.title;

    const items = [];
    $(listSelector).each((i, el) => {
      const $el = $(el);
      let title = $el.find(titleSelector).text().trim();

      if (!title) {
        title = $el.attr('title') || $el.children(titleSelector).text().trim();
      }

      let url = $el.find('link').text().trim();
      if (!url) {
        url = $el.find('a').attr('href');
      }
      if (!url) {
        url = $el.attr('url');
      }

      let publishTime = $el.find(selectors?.publishTime || defaultSelectors.publishTime).text().trim();
      if (!publishTime) {
        publishTime = $el.find('pubDate').text().trim();
      }

      let content = $el.find(selectors?.content || defaultSelectors.content).text().trim();
      if (!content) {
        content = $el.find('description').text().trim();
      }

      let author = $el.find(selectors?.author || defaultSelectors.author).text().trim();
      if (!author) {
        author = $el.find('author').text().trim() || $el.find('dc\\:creator').text().trim();
      }

      if (title && url) {
        items.push({ title, url, publishTime, content, author });
      }
    });

    return items.slice(0, 30);
  }

  parseDetailPage(html, selectors) {
    const $ = cheerio.load(html);
    const contentSelector = selectors?.content || defaultSelectors.content;
    const timeSelector = selectors?.publishTime || defaultSelectors.publishTime;
    const authorSelector = selectors?.author || defaultSelectors.author;

    const title = $('h1').first().text().trim();
    const content = $(contentSelector).text().trim() || $('article').text().trim();
    const publishTimeText = $(timeSelector).first().text().trim();
    const author = $(authorSelector).first().text().trim();

    let publishTime = new Date();
    if (publishTimeText) {
      const parsed = new Date(publishTimeText.replace(/年|月/g, '-').replace(/日/g, ''));
      if (!isNaN(parsed.getTime())) {
        publishTime = parsed;
      }
    }

    const summary = content.substring(0, 200).replace(/\s+/g, ' ');

    return { title, content, summary, publishTime, author };
  }

  resolveUrl(baseUrl, relativeUrl) {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }

  async crawlSource(sourceId, triggeredBy = 'manual') {
    const source = await NewsSource.findById(sourceId);
    if (!source) {
      throw new Error('新闻源不存在');
    }

    const task = new CrawlTask({
      sourceId: source._id,
      sourceName: source.name,
      status: 'running',
      startTime: new Date(),
      triggeredBy
    });
    await task.save();

    let newsCount = 0;
    let newCount = 0;

    try {
      const listUrl = source.listUrl || source.url;
      const listHtml = await this.fetchPage(listUrl);
      const items = this.parseListPage(listHtml, source.selectorConfig, source.type);

      for (const item of items) {
        try {
          const detailUrl = this.resolveUrl(source.url, item.url);
          const existing = await News.findOne({ sourceUrl: detailUrl });
          if (existing) continue;

          let fullTitle = item.title;
          let content = item.content || item.title;
          let publishTime = item.publishTime ? new Date(item.publishTime) : new Date();
          let author = item.author || '';

          // 对于非RSS类型，还需要获取详情页
          if (source.type !== 'rss') {
            try {
              const detailHtml = await this.fetchPage(detailUrl);
              const detail = this.parseDetailPage(detailHtml, source.selectorConfig);
              if (detail.title) fullTitle = detail.title;
              if (detail.content) content = detail.content;
              if (detail.publishTime) publishTime = detail.publishTime;
              if (detail.author) author = detail.author;
            } catch (e) {
              // 详情页获取失败，使用列表数据
            }
          }

          const { sentiment, score } = analyzeSentiment(content || fullTitle);

          // 根据关键词自动分类
          let category = '其他';
          const categoryKeywords = {
            '政治': ['政治', '政府', '国家', '外交', '总统', '总理', '习近平', '特朗普'],
            '经济': ['经济', '金融', '股市', '货币', '贸易', 'GDP', '增长'],
            '科技': ['科技', '技术', 'AI', '人工智能', '互联网', '软件', '芯片'],
            '社会': ['社会', '教育', '医疗', '环境', '环保', '健康'],
            '娱乐': ['娱乐', '明星', '电影', '音乐', '综艺'],
            '体育': ['体育', '足球', '篮球', '奥运', '冠军']
          };

          for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(kw => fullTitle.includes(kw))) {
              category = cat;
              break;
            }
          }

          const news = new News({
            title: fullTitle,
            content: content,
            summary: content.substring(0, 200).replace(/<[^>]+>/g, ''),
            source: source.name,
            sourceUrl: detailUrl,
            author: author,
            publishTime: publishTime,
            sentiment,
            sentimentScore: score,
            heatIndex: 0,
            category,
            keywords: [],
            tags: [],
            sourceId: source._id
          });

          news.heatIndex = calculateHeatIndex(news, 1.2);

          await news.save();
          newCount++;
          newsCount++;
        } catch (err) {
          console.error(`Crawl item error: ${err.message}`);
        }
      }

      task.status = 'completed';
      task.newsCount = newsCount;
      task.newCount = newCount;
      source.lastCrawlTime = new Date();
      await source.save();
    } catch (err) {
      task.status = 'failed';
      task.errorMsg = err.message;
      console.error(`Crawl source ${source.name} error:`, err);
    } finally {
      task.endTime = new Date();
      await task.save();
      await this.closeBrowser();
    }

    return task;
  }
}

const crawler = new NewsCrawler();

module.exports = crawler;
