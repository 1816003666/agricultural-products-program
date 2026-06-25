const { validationResult } = require('express-validator');
const News = require('../models/News');
const { success, error } = require('../utils/response');

const getNewsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const keyword = req.query.keyword || '';
    const sentiment = req.query.sentiment || '';
    const source = req.query.source || '';
    const category = req.query.category || '';
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;

    const query = {};
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (sentiment) query.sentiment = sentiment;
    if (source) query.source = source;
    if (category) query.category = category;
    if (startTime || endTime) {
      query.publishTime = {};
      if (startTime) query.publishTime.$gte = new Date(startTime);
      if (endTime) query.publishTime.$lte = new Date(endTime);
    }

    const total = await News.countDocuments(query);
    const list = await News.find(query)
      .select('title summary source sourceUrl publishTime sentiment sentimentScore heatIndex category keywords author crawledAt')
      .sort({ publishTime: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const getNewsDetail = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return error(res, 404, '新闻不存在');
    }
    success(res, news);
  } catch (err) {
    next(err);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return error(res, 404, '新闻不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalCount, todayCount, positiveCount, negativeCount, neutralCount] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ publishTime: { $gte: todayStart } }),
      News.countDocuments({ sentiment: 'positive' }),
      News.countDocuments({ sentiment: 'negative' }),
      News.countDocuments({ sentiment: 'neutral' })
    ]);

    success(res, {
      totalCount,
      todayCount,
      positiveCount,
      negativeCount,
      neutralCount,
      positiveRate: totalCount > 0 ? (positiveCount / totalCount * 100).toFixed(1) : 0,
      negativeRate: totalCount > 0 ? (negativeCount / totalCount * 100).toFixed(1) : 0
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNewsList, getNewsDetail, deleteNews, getStatistics };
