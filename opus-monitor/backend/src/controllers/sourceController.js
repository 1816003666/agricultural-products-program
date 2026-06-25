const { validationResult } = require('express-validator');
const NewsSource = require('../models/NewsSource');
const { success, error } = require('../utils/response');

const getSourceList = async (req, res, next) => {
  try {
    const list = await NewsSource.find().sort({ createdAt: -1 });
    success(res, { list, total: list.length });
  } catch (err) {
    next(err);
  }
};

const createSource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { name, url, type, listUrl, selectorConfig, crawlInterval } = req.body;
    const existing = await NewsSource.findOne({ name });
    if (existing) {
      return error(res, 409, '新闻源名称已存在');
    }
    const source = new NewsSource({
      name,
      url,
      type: type || 'crawler',
      listUrl: listUrl || '',
      selectorConfig: selectorConfig || {},
      crawlInterval: crawlInterval || '0 */2 * * *'
    });
    await source.save();
    success(res, source, '添加成功');
  } catch (err) {
    next(err);
  }
};

const updateSource = async (req, res, next) => {
  try {
    const source = await NewsSource.findById(req.params.id);
    if (!source) {
      return error(res, 404, '新闻源不存在');
    }
    const { name, url, type, listUrl, selectorConfig, crawlInterval, status } = req.body;
    if (name && name !== source.name) {
      const existing = await NewsSource.findOne({ name });
      if (existing) {
        return error(res, 409, '新闻源名称已存在');
      }
      source.name = name;
    }
    if (url !== undefined) source.url = url;
    if (type !== undefined) source.type = type;
    if (listUrl !== undefined) source.listUrl = listUrl;
    if (selectorConfig !== undefined) source.selectorConfig = selectorConfig;
    if (crawlInterval !== undefined) source.crawlInterval = crawlInterval;
    if (status !== undefined) source.status = status;
    await source.save();
    success(res, source, '更新成功');
  } catch (err) {
    next(err);
  }
};

const deleteSource = async (req, res, next) => {
  try {
    const source = await NewsSource.findByIdAndDelete(req.params.id);
    if (!source) {
      return error(res, 404, '新闻源不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSourceList, createSource, updateSource, deleteSource };
