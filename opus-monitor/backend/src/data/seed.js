const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Keyword = require('../models/Keyword');
const NewsSource = require('../models/NewsSource');
const News = require('../models/News');
const { generateMockNews } = require('./mockNews');

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created: admin / admin123');
    }

    const analystExists = await User.findOne({ username: 'analyst' });
    if (!analystExists) {
      const analyst = new User({
        username: 'analyst',
        email: 'analyst@example.com',
        password: 'analyst123',
        role: 'analyst'
      });
      await analyst.save();
      console.log('Analyst user created: analyst / analyst123');
    }

    const viewerExists = await User.findOne({ username: 'viewer' });
    if (!viewerExists) {
      const viewer = new User({
        username: 'viewer',
        email: 'viewer@example.com',
        password: 'viewer123',
        role: 'viewer'
      });
      await viewer.save();
      console.log('Viewer user created: viewer / viewer123');
    }

    const defaultKeywords = [
      { word: '经济发展', category: '经济' },
      { word: '科技创新', category: '科技' },
      { word: '人工智能', category: '科技' },
      { word: '新能源', category: '科技' },
      { word: '环境保护', category: '社会' },
      { word: '教育改革', category: '社会' },
      { word: '医疗健康', category: '社会' },
      { word: '房地产', category: '经济' },
      { word: '股市', category: '经济' },
      { word: '国际贸易', category: '经济' }
    ];

    for (const kw of defaultKeywords) {
      const exists = await Keyword.findOne({ word: kw.word });
      if (!exists) {
        await Keyword.create(kw);
        console.log(`Keyword created: ${kw.word}`);
      }
    }

    const defaultSources = [
      {
        name: '新浪新闻',
        url: 'https://news.sina.com.cn',
        type: 'rss',
        listUrl: 'http://rss.sina.com.cn/news/china/focus15.xml',
        crawlInterval: '0 */2 * * *',
        status: 'active'
      },
      {
        name: '搜狐新闻',
        url: 'https://news.sohu.com',
        type: 'rss',
        listUrl: 'http://rss.sohu.com/news.xml',
        crawlInterval: '0 */2 * * *',
        status: 'active'
      },
      {
        name: '网易新闻',
        url: 'https://news.163.com',
        type: 'rss',
        listUrl: 'https://www.163.com/rss/#',
        crawlInterval: '0 */2 * * *',
        status: 'active'
      },
      {
        name: '腾讯新闻',
        url: 'https://news.qq.com',
        type: 'rss',
        listUrl: 'https://news.qq.com/rss/newsrss.xml',
        crawlInterval: '0 */2 * * *',
        status: 'active'
      }
    ];

    for (const src of defaultSources) {
      await NewsSource.findOneAndDelete({ name: src.name });
      await NewsSource.create(src);
      console.log(`News source created: ${src.name}`);
    }

    // 生成模拟新闻数据作为演示
    const mockNews = generateMockNews(50);
    await News.insertMany(mockNews);
    console.log(`${mockNews.length} mock news articles created (for demo purposes)`);

    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
