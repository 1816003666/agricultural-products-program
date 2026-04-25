const OperationLog = require("../models/OperationLog");
const User = require("../models/User");
const { Op } = require("sequelize");

// 记录操作日志
exports.createLog = async (
  userId,
  action,
  targetType,
  targetId,
  description,
  req,
) => {
  try {
    await OperationLog.create({
      UserId: userId,
      action,
      target_type: targetType,
      target_id: targetId,
      description,
      ip_address: req?.ip || req?.connection?.remoteAddress || "unknown",
      user_agent: req?.headers?.["user-agent"] || "unknown",
    });
  } catch (error) {
    console.error("创建操作日志失败:", error);
  }
};

// 获取操作日志列表（管理员）
exports.getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userId,
      startDate,
      endDate,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (userId) where.UserId = userId;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const { count, rows: logs } = await OperationLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "username", "name", "role"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      logs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取操作日志失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取操作类型统计
exports.getActionStats = async (req, res) => {
  try {
    const stats = await OperationLog.findAll({
      attributes: [
        "action",
        [
          OperationLog.sequelize.fn(
            "COUNT",
            OperationLog.sequelize.col("action"),
          ),
          "count",
        ],
      ],
      group: ["action"],
      raw: true,
    });

    res.json({ stats });
  } catch (error) {
    console.error("获取操作统计失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取日志详情
exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await OperationLog.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "name", "role"],
        },
      ],
    });

    if (!log) {
      return res.status(404).json({ message: "日志不存在" });
    }

    res.json({ log });
  } catch (error) {
    console.error("获取日志详情失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 删除日志（管理员）
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await OperationLog.findByPk(id);
    if (!log) {
      return res.status(404).json({ message: "日志不存在" });
    }

    await log.destroy();
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除日志失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 清空日志（管理员）
exports.clearLogs = async (req, res) => {
  try {
    const { days } = req.body; // days参数表示保留多少天内的日志

    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      await OperationLog.destroy({
        where: {
          created_at: { [Op.lt]: cutoffDate },
        },
      });
    } else {
      await OperationLog.destroy({ where: {} });
    }

    res.json({ message: "清空成功" });
  } catch (error) {
    console.error("清空日志失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
