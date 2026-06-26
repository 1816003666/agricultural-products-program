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

  async fetchNewsLinks(page, url, sourceName) {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // 根据不同网站选择器
    let pattern = 'a[href*="sina.com.cn/c/"]';
    if (sourceName.includes('财经')) {
      pattern = 'a[href*="finance.sina.com.cn/"][href*=".shtml"]';
    }

    const links = await page.evaluate((sel) => {
      const items = [];
      document.querySelectorAll(sel).forEach(a => {
        const title = a.textContent.trim();
        const href = a.href;
        if (title && href && title.length > 15 && !items.find(i => i.href === href)) {
          items.push({ title, href });
        }
      });
      return items.slice(0, 20);
    }, pattern);

    return links;
  }

  async fetchNewsDetail(page, url, fallbackTitle) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    return await page.evaluate(() => {
      // 尝试多种标题选择器
      let title = '';
      const titleSelectors = ['h1', 'h1.main-title', '.main-title', '.article-title', '.article-header h1'];
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 10) {
          title = el.textContent.trim();
          break;
        }
      }

      // 内容
      const contentSelectors = ['.article-content', '#artibody', '.content', 'article'];
      let content = '';
      for (const sel of contentSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          content = el.textContent.trim().replace(/\(sinaads.*?\)/g, '').replace(/push\(\{.*?\}\)/g, '');
          break;
        }
      }

      const timeStr = document.querySelector('.time, .date, .article-time')?.textContent?.trim() || '';
      const source = document.querySelector('.source, .media-name')?.textContent?.trim() || '';
      return { title, content, timeStr, source };
    });
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
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      // 获取新闻列表
      const listUrl = source.listUrl || source.url;
      const links = await this.fetchNewsLinks(page, listUrl, source.name);
      console.log(`Found ${links.length} links from ${source.name}`);

      for (const link of links) {
        try {
          // 检查是否已存在
          const existing = await News.findOne({ sourceUrl: link.href });
          if (existing) continue;

          // 获取详情
          const detail = await this.fetchNewsDetail(page, link.href, link.title);

          let fullTitle = detail.title;
          if (!fullTitle || fullTitle === '新闻中心' || fullTitle.includes('新浪')) {
            fullTitle = link.title;
          }

          const content = detail.content || link.title;
          if (!fullTitle) continue;

          const { sentiment, score } = analyzeSentiment(content);

          // 分类
          let category = '其他';
          const categoryKeywords = {
            '政治': ['政治', '政府', '国家', '外交', '习近平', '国务院', '政策'],
            '经济': ['经济', '金融', '股市', '货币', 'GDP', '贸易', '企业'],
            '科技': ['科技', '技术', 'AI', '人工智能', '互联网', '芯片'],
            '社会': ['社会', '教育', '医疗', '环境', '民生', '养老'],
            '娱乐': ['娱乐', '明星', '电影', '综艺'],
            '体育': ['体育', '足球', '篮球', '奥运']
          };

          for (const [cat, kws] of Object.entries(categoryKeywords)) {
            if (kws.some(kw => fullTitle.includes(kw))) {
              category = cat;
              break;
            }
          }

          let publishTime = new Date();
          if (detail.timeStr) {
            const parsed = new Date(detail.timeStr.replace(/[年月]/g, '-').replace('日', ''));
            if (!isNaN(parsed.getTime())) {
              publishTime = parsed;
            }
          }

          const news = new News({
            title: fullTitle,
            content: content,
            summary: content.substring(0, 200),
            source: source.name,
            sourceUrl: link.href,
            author: detail.source || '',
            publishTime,
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

          console.log(`  + ${fullTitle.substring(0, 40)} (${sentiment})`);
        } catch (err) {
          console.log(`  - Error: ${err.message}`);
        }
      }

      await page.close();
      task.status = 'completed';
      task.newsCount = newsCount;
      task.newCount = newCount;
      source.lastCrawlTime = new Date();
      await source.save();
    } catch (err) {
      task.status = 'failed';
      task.errorMsg = err.message;
      console.error(`Crawl error:`, err);
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
