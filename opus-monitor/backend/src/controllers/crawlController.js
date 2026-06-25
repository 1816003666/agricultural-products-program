const crawler = require('../crawler/newsCrawler');
const CrawlTask = require('../models/CrawlTask');
const NewsSource = require('../models/NewsSource');
const { success, error } = require('../utils/response');

const triggerCrawl = async (req, res, next) => {
  try {
    const { sourceId } = req.body;
    if (!sourceId) {
      return error(res, 400, '缺少新闻源ID');
    }
    const source = await NewsSource.findById(sourceId);
    if (!source) {
      return error(res, 404, '新闻源不存在');
    }

    crawler.crawlSource(sourceId, 'manual').catch(err => {
      console.error('Crawl error:', err);
    });

    success(res, null, '采集任务已启动');
  } catch (err) {
    next(err);
  }
};

const getTaskList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const status = req.query.status || '';

    const query = {};
    if (status) query.status = status;

    const total = await CrawlTask.countDocuments(query);
    const list = await CrawlTask.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const getTaskDetail = async (req, res, next) => {
  try {
    const task = await CrawlTask.findById(req.params.id);
    if (!task) {
      return error(res, 404, '任务不存在');
    }
    success(res, task);
  } catch (err) {
    next(err);
  }
};

module.exports = { triggerCrawl, getTaskList, getTaskDetail };
