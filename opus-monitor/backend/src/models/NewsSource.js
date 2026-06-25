const mongoose = require('mongoose');

const selectorConfigSchema = new mongoose.Schema({
  listItem: { type: String, default: '' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  publishTime: { type: String, default: '' },
  author: { type: String, default: '' }
}, { _id: false });

const newsSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['rss', 'api', 'crawler'],
    default: 'crawler'
  },
  listUrl: {
    type: String,
    default: ''
  },
  selectorConfig: {
    type: selectorConfigSchema,
    default: () => ({})
  },
  crawlInterval: {
    type: String,
    default: '0 */2 * * *'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastCrawlTime: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsSource', newsSourceSchema);
