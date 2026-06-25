const { validationResult } = require('express-validator');
const Keyword = require('../models/Keyword');
const { success, error } = require('../utils/response');

const getKeywordList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const status = req.query.status || '';

    const query = {};
    if (status) query.status = status;

    const total = await Keyword.countDocuments(query);
    const list = await Keyword.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const createKeyword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { word, category } = req.body;
    const existing = await Keyword.findOne({ word });
    if (existing) {
      return error(res, 409, '关键词已存在');
    }
    const keyword = new Keyword({
      word,
      category: category || '默认',
      createdBy: req.user._id
    });
    await keyword.save();
    success(res, keyword, '添加成功');
  } catch (err) {
    next(err);
  }
};

const updateKeyword = async (req, res, next) => {
  try {
    const { word, category, status } = req.body;
    const keyword = await Keyword.findById(req.params.id);
    if (!keyword) {
      return error(res, 404, '关键词不存在');
    }
    if (word && word !== keyword.word) {
      const existing = await Keyword.findOne({ word });
      if (existing) {
        return error(res, 409, '关键词已存在');
      }
      keyword.word = word;
    }
    if (category !== undefined) keyword.category = category;
    if (status !== undefined) keyword.status = status;
    await keyword.save();
    success(res, keyword, '更新成功');
  } catch (err) {
    next(err);
  }
};

const deleteKeyword = async (req, res, next) => {
  try {
    const keyword = await Keyword.findByIdAndDelete(req.params.id);
    if (!keyword) {
      return error(res, 404, '关键词不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

module.exports = { getKeywordList, createKeyword, updateKeyword, deleteKeyword };
