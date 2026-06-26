const puppeteer = require('puppeteer');
const News = require('./src/models/News');
const { analyzeSentiment, calculateHeatIndex } = require('./src/services/sentimentService');
const mongoose = require('mongoose');
const config = require('./src/config');

const newsSites = [
  {
    name: '新浪新闻',
    url: 'https://news.sina.com.cn/china/',
    linkPattern: 'a[href*="sina.com.cn/c/"]'
  },
  {
    name: '新浪财经',
    url: 'https://finance.sina.com.cn/',
    linkPattern: 'a[href*="finance.sina.com.cn/"][href*=".shtml"]'
  }
];

const crawlRealNews = async () => {
  await mongoose.connect(config.mongodbUri);
  console.log('Connected to MongoDB');

  // 清除旧的模拟数据
  await News.deleteMany({});
  console.log('Cleared old news data');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  const allNews = [];

  for (const site of newsSites) {
    try {
      console.log(`\nCrawling ${site.name}...`);
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // 获取新闻链接
      const links = await page.evaluate((pattern) => {
        const items = [];
        document.querySelectorAll(pattern).forEach(a => {
          const title = a.textContent.trim();
          const href = a.href;
          if (title && href && title.length > 15 && !items.find(i => i.href === href)) {
            items.push({ title, href });
          }
        });
        return items.slice(0, 20);
      }, site.linkPattern);

      console.log(`Found ${links.length} links from ${site.name}`);

      // 获取每条新闻详情
      for (const link of links) {
        try {
          await page.goto(link.href, { waitUntil: 'domcontentloaded', timeout: 15000 });

          const detail = await page.evaluate(() => {
            // 尝试多种标题选择器
            let title = '';
            const titleSelectors = ['h1', 'h1.main-title', '.main-title', '.article-title', 'title'];
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
                content = el.textContent.trim();
                // 清理广告等无用内容
                content = content.replace(/\(sinaads.*?\)/g, '').replace(/push\(\{.*?\}\)/g, '');
                break;
              }
            }

            const timeStr = document.querySelector('.time, .date, .article-time')?.textContent?.trim() || '';
            const source = document.querySelector('.source, .media-name')?.textContent?.trim() || '';
            return { title, content, timeStr, source };
          });

          // 如果标题仍然是通用标题，使用链接上的标题
          if (!detail.title || detail.title === '新闻中心' || detail.title.includes('新浪')) {
            detail.title = link.title;
          }

          if (detail.title && detail.content) {
            const { sentiment, score } = analyzeSentiment(detail.content);

            // 分类
            let category = '其他';
            const categoryKeywords = {
              '政治': ['政治', '政府', '国家', '外交', '习近平', '国务院', '政策'],
              '经济': ['经济', '金融', '股市', '货币', 'GDP', '贸易', '企业'],
              '科技': ['科技', '技术', 'AI', '人工智能', '互联网', '芯片', '手机'],
              '社会': ['社会', '教育', '医疗', '环境', '民生', '养老'],
              '娱乐': ['娱乐', '明星', '电影', '综艺'],
              '体育': ['体育', '足球', '篮球', '奥运']
            };
            for (const [cat, kws] of Object.entries(categoryKeywords)) {
              if (kws.some(kw => detail.title.includes(kw) || detail.content.includes(kw))) {
                category = cat;
                break;
              }
            }

            const newsData = {
              title: detail.title,
              content: detail.content,
              summary: detail.content.substring(0, 200),
              source: site.name,
              sourceUrl: link.href,
              author: detail.source,
              publishTime: detail.timeStr ? new Date(detail.timeStr.replace(/[年月]/g, '-').replace('日', '')) : new Date(),
              sentiment,
              sentimentScore: score,
              heatIndex: Math.round((Math.random() * 50 + 50) * 10) / 10,
              category,
              keywords: [],
              tags: []
            };

            allNews.push(newsData);
            console.log(`  + ${detail.title.substring(0, 40)} (${sentiment})`);
          }
        } catch (e) {
          console.log(`  - Skip: ${link.title.substring(0, 30)} (${e.message})`);
        }
      }
    } catch (e) {
      console.error(`Error crawling ${site.name}:`, e.message);
    }
  }

  await browser.close();

  if (allNews.length > 0) {
    await News.insertMany(allNews);
    console.log(`\n✓ Saved ${allNews.length} real news articles to database`);
  } else {
    console.log('\n✗ No news articles collected');
  }

  await mongoose.disconnect();
  process.exit(0);
};

crawlRealNews();