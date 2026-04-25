const Coupon = require("../models/Coupon");
const UserCoupon = require("../models/UserCoupon");
const User = require("../models/User");
const { Op } = require("sequelize");

// 管理员创建优惠券
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      value,
      min_amount,
      max_discount,
      total_count,
      start_date,
      end_date,
    } = req.body;

    // 检查优惠券码是否已存在
    const existingCoupon = await Coupon.findOne({ where: { code } });
    if (existingCoupon) {
      return res.status(400).json({ message: "优惠券码已存在" });
    }

    const coupon = await Coupon.create({
      code,
      name,
      type,
      value,
      min_amount: min_amount || 0,
      max_discount,
      total_count,
      used_count: 0,
      start_date,
      end_date,
      status: "active",
    });

    res.status(201).json({ message: "优惠券创建成功", coupon });
  } catch (error) {
    console.error("创建优惠券失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取优惠券列表（管理员）
exports.getCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      coupons,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取优惠券列表失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 用户领取优惠券
exports.claimCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const userId = req.user.id;

    // 检查优惠券是否存在且有效
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "优惠券不存在" });
    }

    if (coupon.status !== "active") {
      return res.status(400).json({ message: "优惠券已失效" });
    }

    const now = new Date();
    if (now < coupon.start_date || now > coupon.end_date) {
      return res.status(400).json({ message: "优惠券不在领取时间内" });
    }

    if (coupon.used_count >= coupon.total_count) {
      return res.status(400).json({ message: "优惠券已领完" });
    }

    // 检查用户是否已经领取过该优惠券
    const existingClaim = await UserCoupon.findOne({
      where: { UserId: userId, CouponId: couponId },
    });

    if (existingClaim) {
      return res.status(400).json({ message: "已经领取过该优惠券" });
    }

    // 创建用户优惠券记录
    const userCoupon = await UserCoupon.create({
      UserId: userId,
      CouponId: couponId,
      status: "unused",
    });

    // 更新优惠券已领取数量
    coupon.used_count += 1;
    await coupon.save();

    res.status(201).json({ message: "领取成功", userCoupon });
  } catch (error) {
    console.error("领取优惠券失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 用户通过优惠券码领取
exports.claimCouponByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // 通过优惠券码查找优惠券
    const coupon = await Coupon.findOne({ where: { code } });
    if (!coupon) {
      return res.status(404).json({ message: "优惠券不存在" });
    }

    if (coupon.status !== "active") {
      return res.status(400).json({ message: "优惠券已失效" });
    }

    const now = new Date();
    if (now < coupon.start_date || now > coupon.end_date) {
      return res.status(400).json({ message: "优惠券不在领取时间内" });
    }

    if (coupon.used_count >= coupon.total_count) {
      return res.status(400).json({ message: "优惠券已领完" });
    }

    // 检查用户是否已经领取过该优惠券
    const existingClaim = await UserCoupon.findOne({
      where: { UserId: userId, CouponId: coupon.id },
    });

    if (existingClaim) {
      return res.status(400).json({ message: "已经领取过该优惠券" });
    }

    // 创建用户优惠券记录
    const userCoupon = await UserCoupon.create({
      UserId: userId,
      CouponId: coupon.id,
      status: "unused",
    });

    // 更新优惠券已领取数量
    coupon.used_count += 1;
    await coupon.save();

    res.status(201).json({ message: "领取成功", userCoupon });
  } catch (error) {
    console.error("通过优惠券码领取失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取用户的优惠券列表
exports.getUserCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const where = { UserId: userId };
    if (status) where.status = status;

    const userCoupons = await UserCoupon.findAll({
      where,
      include: [
        {
          model: Coupon,
          where: status ? { status } : {},
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ userCoupons });
  } catch (error) {
    console.error("获取用户优惠券失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 验证优惠券是否可用
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ where: { code } });
    if (!coupon) {
      return res.status(404).json({ message: "优惠券不存在", valid: false });
    }

    if (coupon.status !== "active") {
      return res.status(400).json({ message: "优惠券已失效", valid: false });
    }

    const now = new Date();
    if (now < coupon.start_date) {
      return res.status(400).json({ message: "优惠券还未开始", valid: false });
    }
    if (now > coupon.end_date) {
      return res.status(400).json({ message: "优惠券已过期", valid: false });
    }

    // 检查用户是否已领取该优惠券
    const userCoupon = await UserCoupon.findOne({
      where: { UserId: userId, CouponId: coupon.id, status: "unused" },
    });

    if (!userCoupon) {
      return res
        .status(400)
        .json({ message: "未领取该优惠券或已使用", valid: false });
    }

    // 检查最低消费金额
    if (orderAmount < coupon.min_amount) {
      return res.status(400).json({
        message: `订单金额需达到 ${coupon.min_amount} 元才能使用该优惠券`,
        valid: false,
      });
    }

    // 计算优惠金额
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      discount: discount.toFixed(2),
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
      },
    });
  } catch (error) {
    console.error("验证优惠券失败:", error);
    res.status(500).json({ message: "服务器错误", valid: false });
  }
};

// 使用优惠券
exports.useCoupon = async (req, res) => {
  try {
    const { couponId, orderId } = req.body;
    const userId = req.user.id;

    const userCoupon = await UserCoupon.findOne({
      where: { UserId: userId, CouponId: couponId, status: "unused" },
      include: [Coupon],
    });

    if (!userCoupon) {
      return res.status(404).json({ message: "优惠券不存在或已使用" });
    }

    userCoupon.status = "used";
    userCoupon.used_at = new Date();
    userCoupon.order_id = orderId;
    await userCoupon.save();

    res.json({ message: "优惠券使用成功", userCoupon });
  } catch (error) {
    console.error("使用优惠券失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新优惠券状态
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      name,
      value,
      min_amount,
      max_discount,
      total_count,
      start_date,
      end_date,
    } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "优惠券不存在" });
    }

    if (name) coupon.name = name;
    if (value) coupon.value = value;
    if (min_amount !== undefined) coupon.min_amount = min_amount;
    if (max_discount !== undefined) coupon.max_discount = max_discount;
    if (total_count) coupon.total_count = total_count;
    if (start_date) coupon.start_date = start_date;
    if (end_date) coupon.end_date = end_date;
    if (status) coupon.status = status;

    await coupon.save();

    res.json({ message: "优惠券更新成功", coupon });
  } catch (error) {
    console.error("更新优惠券失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 删除优惠券
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "优惠券不存在" });
    }

    await coupon.destroy();
    res.json({ message: "优惠券删除成功" });
  } catch (error) {
    console.error("删除优惠券失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
