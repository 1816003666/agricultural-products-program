const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  sourceUrl: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: String,
    default: ''
  },
  publishTime: {
    type: Date,
    required: true,
    index: true
  },
  keywords: [{
    type: String
  }],
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
    index: true
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  heatIndex: {
    type: Number,
    default: 0,
    index: true
  },
  category: {
    type: String,
    enum: ['政治', '经济', '科技', '社会', '娱乐', '体育', '其他'],
    default: '其他',
    index: true
  },
  tags: [{
    type: String
  }],
  crawledAt: {
    type: Date,
    default: Date.now
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NewsSource'
  }
}, {
  timestamps: true
});

newsSchema.index({ title: 'text', content: 'text', summary: 'text' });

module.exports = mongoose.model('News', newsSchema);
