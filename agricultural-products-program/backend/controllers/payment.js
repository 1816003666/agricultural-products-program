const Order = require("../models/Order");
const { successResponse, errorResponse, notFoundResponse } = require("../utils/response");

// 支付方式配置
const paymentMethods = [
  { id: 'wechat', name: '微信支付', icon: '💳' },
  { id: 'alipay', name: '支付宝', icon: '💳' },
  { id: 'creditcard', name: '信用卡', icon: '💳' },
  { id: 'cod', name: '货到付款', icon: '💵' }
];

// 获取可用的支付方式
const getPaymentMethods = async (req, res) => {
  try {
    return successResponse(res, paymentMethods, "获取支付方式成功");
  } catch (error) {
    console.error("获取支付方式错误:", error);
    return errorResponse(res, "获取支付方式失败");
  }
};

// 创建支付订单
const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id, payment_method, amount } = req.body;

    // 查找订单
    const order = await Order.findOne({
      where: { id: order_id, user_id: userId, status: "pending" },
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在或已支付");
    }

    // 验证金额
    if (order.total_amount !== amount) {
      return errorResponse(res, "金额不匹配");
    }

    // 模拟创建支付订单
    const paymentOrder = {
      order_id: order.id,
      payment_method,
      amount: order.total_amount,
      transaction_id: `TXN${Date.now()}`,
      status: "pending",
      created_at: new Date(),
    };

    // 模拟支付处理
    setTimeout(async () => {
      // 更新订单状态为已支付
      await order.update({
        status: "paid",
        paid_at: new Date(),
      });

      // 生成物流单号
      const trackingNumber = "SF" + Date.now();
      await order.update({
        tracking_number: trackingNumber,
      });
    }, 2000);

    return successResponse(res, paymentOrder, "创建支付订单成功");
  } catch (error) {
    console.error("创建支付订单错误:", error);
    return errorResponse(res, "创建支付订单失败");
  }
};

// 查询支付状态
const getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id } = req.params;

    // 查找订单
    const order = await Order.findOne({
      where: { id: order_id, user_id: userId },
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在");
    }

    // 根据订单状态返回支付状态
    const paymentStatus = {
      order_id: order.id,
      status: order.status,
      paid_at: order.paid_at,
      message: getPaymentStatusMessage(order.status),
    };

    return successResponse(res, paymentStatus, "查询支付状态成功");
  } catch (error) {
    console.error("查询支付状态错误:", error);
    return errorResponse(res, "查询支付状态失败");
  }
};

// 获取支付状态消息
const getPaymentStatusMessage = (status) => {
  switch (status) {
    case "pending":
      return "待支付";
    case "paid":
      return "支付成功";
    case "delivered":
      return "已发货";
    case "refunded":
      return "已退款";
    default:
      return "未知状态";
  }
};

module.exports = {
  getPaymentMethods,
  createPayment,
  getPaymentStatus,
};
