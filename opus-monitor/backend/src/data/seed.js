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
        type: 'crawler',
        listUrl: 'https://news.sina.com.cn/china/',
        crawlInterval: '0 8 * * *',  // 每天早上8点
        status: 'active'
      },
      {
        name: '新浪财经',
        url: 'https://finance.sina.com.cn',
        type: 'crawler',
        listUrl: 'https://finance.sina.com.cn/',
        crawlInterval: '0 8 * * *',  // 每天早上8点
        status: 'active'
      }
    ];

    // 清除所有旧新闻源，重新创建
    await NewsSource.deleteMany({});
    console.log('Cleared all news sources');

    for (const src of defaultSources) {
      await NewsSource.create(src);
      console.log(`News source created: ${src.name} (interval: ${src.crawlInterval})`);
    }

    // 保留现有的新闻数据，不重新生成

    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
