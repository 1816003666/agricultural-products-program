const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const News = require('../models/News');
const NewsSource = require('../models/NewsSource');
const CrawlTask = require('../models/CrawlTask');
const { analyzeSentiment, calculateHeatIndex } = require('../services/sentimentService');

const defaultSelectors = {
  listItem: 'article, .news-item, .item, li',
  title: 'h1, .title, .news-title',
  content: '.content, .article-content, .news-content',
  publishTime: '.time, .date, .publish-time',
  author: '.author, .source'
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

  parseListPage(html, selectors) {
    const $ = cheerio.load(html);
    const items = [];
    const listSelector = selectors?.listItem || defaultSelectors.listItem;
    const titleSelector = selectors?.title || defaultSelectors.title;

    $(listSelector).each((i, el) => {
      const $el = $(el);
      const $title = $el.find(titleSelector);
      const title = $title.text().trim();
      let url = $el.find('a').attr('href') || $title.find('a').attr('href');
      if (title && url) {
        items.push({ title, url });
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
      const items = this.parseListPage(listHtml, source.selectorConfig);

      for (const item of items) {
        try {
          const detailUrl = this.resolveUrl(source.url, item.url);
          const existing = await News.findOne({ sourceUrl: detailUrl });
          if (existing) continue;

          const detailHtml = await this.fetchPage(detailUrl);
          const detail = this.parseDetailPage(detailHtml, source.selectorConfig);

          const fullTitle = detail.title || item.title;
          const { sentiment, score } = analyzeSentiment(detail.content || fullTitle);

          const categories = ['政治', '经济', '科技', '社会', '娱乐', '体育', '其他'];
          const category = categories[Math.floor(Math.random() * (categories.length - 1))];

          const news = new News({
            title: fullTitle,
            content: detail.content || item.title,
            summary: detail.summary || fullTitle.substring(0, 100),
            source: source.name,
            sourceUrl: detailUrl,
            author: detail.author || '',
            publishTime: detail.publishTime,
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
