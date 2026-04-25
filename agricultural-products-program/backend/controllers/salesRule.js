const SalesRule = require("../models/SalesRule");
const { Op } = require("sequelize");

// 创建促销规则
exports.createSalesRule = async (req, res) => {
  try {
    const {
      name,
      type,
      min_amount,
      discount,
      max_discount,
      start_date,
      end_date,
    } = req.body;

    const salesRule = await SalesRule.create({
      name,
      type,
      min_amount,
      discount,
      max_discount,
      start_date,
      end_date,
      status: "inactive",
    });

    res.status(201).json({ message: "促销规则创建成功", salesRule });
  } catch (error) {
    console.error("创建促销规则失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取促销规则列表
exports.getSalesRules = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows: salesRules } = await SalesRule.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      salesRules,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取促销规则列表失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取当前有效的促销规则
exports.getActiveSalesRules = async (req, res) => {
  try {
    const now = new Date();

    const salesRules = await SalesRule.findAll({
      where: {
        status: "active",
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
      order: [["min_amount", "ASC"]],
    });

    res.json({ salesRules });
  } catch (error) {
    console.error("获取有效促销规则失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取促销规则详情
exports.getSalesRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const salesRule = await SalesRule.findByPk(id);

    if (!salesRule) {
      return res.status(404).json({ message: "促销规则不存在" });
    }

    res.json({ salesRule });
  } catch (error) {
    console.error("获取促销规则详情失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新促销规则
exports.updateSalesRule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      min_amount,
      discount,
      max_discount,
      start_date,
      end_date,
      status,
    } = req.body;

    const salesRule = await SalesRule.findByPk(id);
    if (!salesRule) {
      return res.status(404).json({ message: "促销规则不存在" });
    }

    if (name) salesRule.name = name;
    if (type) salesRule.type = type;
    if (min_amount !== undefined) salesRule.min_amount = min_amount;
    if (discount !== undefined) salesRule.discount = discount;
    if (max_discount !== undefined) salesRule.max_discount = max_discount;
    if (start_date) salesRule.start_date = start_date;
    if (end_date) salesRule.end_date = end_date;
    if (status) salesRule.status = status;

    await salesRule.save();

    res.json({ message: "促销规则更新成功", salesRule });
  } catch (error) {
    console.error("更新促销规则失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 删除促销规则
exports.deleteSalesRule = async (req, res) => {
  try {
    const { id } = req.params;

    const salesRule = await SalesRule.findByPk(id);
    if (!salesRule) {
      return res.status(404).json({ message: "促销规则不存在" });
    }

    await salesRule.destroy();

    res.json({ message: "促销规则删除成功" });
  } catch (error) {
    console.error("删除促销规则失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 激活/停用促销规则
exports.toggleSalesRuleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const salesRule = await SalesRule.findByPk(id);
    if (!salesRule) {
      return res.status(404).json({ message: "促销规则不存在" });
    }

    salesRule.status = salesRule.status === "active" ? "inactive" : "active";
    await salesRule.save();

    res.json({ message: "促销规则状态更新成功", salesRule });
  } catch (error) {
    console.error("更新促销规则状态失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 应用促销规则计算优惠
exports.applySalesRule = async (req, res) => {
  try {
    const { orderAmount } = req.body;

    const now = new Date();
    // 获取所有有效的促销规则
    const salesRules = await SalesRule.findAll({
      where: {
        status: "active",
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
        min_amount: { [Op.lte]: orderAmount },
      },
      order: [["min_amount", "DESC"]], // 按最低消费金额降序，优先使用门槛高的规则
    });

    if (salesRules.length === 0) {
      return res.json({ applicable: false, discount: 0, rule: null });
    }

    // 选择最合适的规则
    const bestRule = salesRules[0];
    let discount = 0;

    if (bestRule.type === "满减") {
      discount = bestRule.discount;
    } else if (bestRule.type === "满折") {
      discount = (orderAmount * bestRule.discount) / 100;
      if (bestRule.max_discount && discount > bestRule.max_discount) {
        discount = bestRule.max_discount;
      }
    }

    res.json({
      applicable: true,
      discount: discount.toFixed(2),
      rule: {
        id: bestRule.id,
        name: bestRule.name,
        type: bestRule.type,
        min_amount: bestRule.min_amount,
        discount: bestRule.discount,
      },
    });
  } catch (error) {
    console.error("应用促销规则失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};