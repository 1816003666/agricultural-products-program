const News = require('../models/News');
const Keyword = require('../models/Keyword');
const { success } = require('../utils/response');

const getSentimentTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const result = await News.aggregate([
      {
        $match: {
          publishTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishTime' }
          },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dateList = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    const dataMap = {};
    result.forEach(item => {
      dataMap[item._id] = item;
    });

    const trendData = dateList.map(date => ({
      date,
      positive: dataMap[date]?.positive || 0,
      negative: dataMap[date]?.negative || 0,
      neutral: dataMap[date]?.neutral || 0,
      total: dataMap[date]?.total || 0
    }));

    success(res, trendData);
  } catch (err) {
    next(err);
  }
};

const getHeatRanking = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const list = await News.find()
      .select('title source sentiment heatIndex publishTime sourceUrl')
      .sort({ heatIndex: -1, publishTime: -1 })
      .limit(limit);
    success(res, list);
  } catch (err) {
    next(err);
  }
};

const getSourceDistribution = async (req, res, next) => {
  try {
    const result = await News.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const data = result.map(item => ({
      source: item._id,
      count: item.count,
      positive: item.positive,
      negative: item.negative
    }));

    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getWordCloud = async (req, res, next) => {
  try {
    const activeKeywords = await Keyword.find({ status: 'active' }).select('word');
    const keywordList = activeKeywords.map(k => k.word);

    const wordData = [];
    for (const word of keywordList) {
      const count = await News.countDocuments({
        $or: [
          { title: { $regex: word, $options: 'i' } },
          { content: { $regex: word, $options: 'i' } }
        ]
      });
      if (count > 0) {
        wordData.push({ name: word, value: count });
      }
    }

    const titleWords = await News.aggregate([
      { $project: { title: 1 } },
      { $limit: 500 }
    ]);

    const wordCount = {};
    const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
    titleWords.forEach(item => {
      const chars = item.title.split(/[\s，。、；：""''（）【】《》！？\.,;:!?\(\)\[\]""''<>]+/).filter(w => w.length >= 2);
      chars.forEach(w => {
        if (!commonWords.includes(w)) {
          wordCount[w] = (wordCount[w] || 0) + 1;
        }
      });
    });

    Object.entries(wordCount).forEach(([name, value]) => {
      if (value >= 2 && !wordData.find(d => d.name === name)) {
        wordData.push({ name, value });
      }
    });

    wordData.sort((a, b) => b.value - a.value);
    success(res, wordData.slice(0, 100));
  } catch (err) {
    next(err);
  }
};

const getCategoryStats = async (req, res, next) => {
  try {
    const result = await News.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const data = result.map(item => ({
      category: item._id,
      count: item.count,
      positive: item.positive,
      negative: item.negative
    }));

    success(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSentimentTrend,
  getHeatRanking,
  getSourceDistribution,
  getWordCloud,
  getCategoryStats
};
