const mongoose = require('mongoose');

const crawlTaskSchema = new mongoose.Schema({
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NewsSource',
    required: true
  },
  sourceName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  newsCount: {
    type: Number,
    default: 0
  },
  newCount: {
    type: Number,
    default: 0
  },
  errorMsg: {
    type: String,
    default: ''
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'schedule'],
    default: 'manual'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CrawlTask', crawlTaskSchema);
