const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const Address = require("../models/Address");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../utils/response");

// 创建订单
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, total_amount } = req.body;

    // 获取用户默认地址
    let address = await Address.findOne({
      where: { user_id: userId, is_default: true },
    });
    if (!address) {
      // 如果没有默认地址，获取第一个地址
      const addresses = await Address.findAll({
        where: { user_id: userId },
        limit: 1,
      });
      if (addresses.length === 0) {
        return errorResponse(res, "请先添加收货地址");
      }
      address = addresses[0];
    }

    if (!items || items.length === 0) {
      return errorResponse(res, "购物车为空");
    }

    // 检查商品库存并计算总金额
    let calculatedTotalAmount = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return errorResponse(res, `商品不存在`);
      }

      // 检查库存
      if (product.stock < item.quantity) {
        return errorResponse(res, `商品 ${product.name} 库存不足`);
      }

      calculatedTotalAmount += product.price * item.quantity;
    }

    // 创建订单
    const order = await Order.create({
      user_id: userId,
      address_id: address.id,
      total_amount: calculatedTotalAmount,
      status: "pending",
    });

    // 创建订单商品
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
      });

      // 更新商品库存和销量
      await Product.update(
        {
          stock: product.stock - item.quantity,
          sold: product.sold + item.quantity,
        },
        { where: { id: item.product_id } },
      );
    }

    // 清空购物车
    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }

    // 获取完整订单信息
    const orderWithItems = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
    });

    return successResponse(res, orderWithItems, "创建订单成功");
  } catch (error) {
    console.error("创建订单错误:", error);
    return errorResponse(res, "创建订单失败");
  }
};

// 支付订单
const payOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 查找订单
    const order = await Order.findOne({
      where: { id, user_id: userId, status: "pending" },
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在或已支付");
    }

    // 更新订单状态为已支付
    await order.update({
      status: "paid",
      paid_at: new Date(),
    });

    // 模拟发货，生成物流单号
    const trackingNumber = "SF" + Date.now();
    await order.update({
      tracking_number: trackingNumber,
    });

    // 获取完整订单信息
    const orderWithItems = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
    });

    return successResponse(res, orderWithItems, "支付成功，订单已发货");
  } catch (error) {
    console.error("支付订单错误:", error);
    return errorResponse(res, "支付失败，请稍后重试");
  }
};

// 获取订单列表
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    const total = await Order.count({ where: { user_id: userId } });

    return successResponse(
      res,
      {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "获取订单列表成功",
    );
  } catch (error) {
    console.error("获取订单列表错误:", error);
    return errorResponse(res, "获取订单列表失败");
  }
};

// 获取订单详情
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在");
    }

    return successResponse(res, order, "获取订单详情成功");
  } catch (error) {
    console.error("获取订单详情错误:", error);
    return errorResponse(res, "获取订单详情失败");
  }
};

// 获取物流信息
const getTracking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, user_id: userId },
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在");
    }

    if (!order.tracking_number) {
      return errorResponse(res, "暂无物流信息");
    }

    // 这里可以集成第三方物流API
    // 现在返回模拟数据
    const trackingInfo = {
      tracking_number: order.tracking_number,
      carrier: "顺丰速运",
      status: order.status,
      history: [
        {
          time: order.created_at,
          status: "订单已创建",
          location: "",
        },
        {
          time: new Date(order.created_at.getTime() + 3600000),
          status: "商家已发货",
          location: "发货地",
        },
        {
          time: new Date(order.created_at.getTime() + 86400000),
          status: "运输中",
          location: "转运中心",
        },
      ],
    };

    return successResponse(res, trackingInfo, "获取物流信息成功");
  } catch (error) {
    console.error("获取物流信息错误:", error);
    return errorResponse(res, "获取物流信息失败");
  }
};

// 确认收货
const confirmReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 查找订单
    const order = await Order.findOne({
      where: { id, user_id: userId, status: "paid" },
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在或状态不正确");
    }

    // 更新订单状态为已收货
    await order.update({
      status: "delivered",
      delivered_at: new Date(),
    });

    // 获取完整订单信息
    const orderWithItems = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
    });

    return successResponse(res, orderWithItems, "确认收货成功");
  } catch (error) {
    console.error("确认收货错误:", error);
    return errorResponse(res, "确认收货失败");
  }
};

// 申请退款
const requestRefund = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 查找订单
    const order = await Order.findOne({
      where: { id, user_id: userId, status: ["paid", "delivered"] },
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在或状态不正确");
    }

    // 更新订单状态为已退款
    await order.update({
      status: "refunded",
      refunded_at: new Date(),
    });

    // 获取完整订单信息
    const orderWithItems = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
    });

    return successResponse(res, orderWithItems, "申请退款成功");
  } catch (error) {
    console.error("申请退款错误:", error);
    return errorResponse(res, "申请退款失败");
  }
};

// 删除订单
const deleteOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 查找订单
    const order = await Order.findOne({
      where: { id, user_id: userId },
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在");
    }

    // 删除订单商品
    await OrderItem.destroy({ where: { order_id: id } });

    // 删除订单
    await order.destroy();

    return successResponse(res, null, "删除订单成功");
  } catch (error) {
    console.error("删除订单错误:", error);
    return errorResponse(res, "删除订单失败");
  }
};

// 获取所有订单列表（管理员）
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (user_id) {
      where.user_id = user_id;
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    const total = await Order.count({ where });

    return successResponse(
      res,
      {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "获取订单列表成功",
    );
  } catch (error) {
    console.error("获取订单列表错误:", error);
    return errorResponse(res, "获取订单列表失败");
  }
};

// 获取订单详情（管理员）
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Address },
      ],
    });

    if (!order) {
      return notFoundResponse(res, "订单不存在");
    }

    return successResponse(res, order, "获取订单详情成功");
  } catch (error) {
    console.error("获取订单详情错误:", error);
    return errorResponse(res, "获取订单详情失败");
  }
};

// 更新订单状态（管理员）
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return notFoundResponse(res, "订单不存在");
    }

    const updateData = { status };

    // 根据状态更新相应的时间戳
    if (status === "paid") {
      updateData.paid_at = new Date();
    } else if (status === "delivered") {
      updateData.delivered_at = new Date();
    } else if (status === "refunded") {
      updateData.refunded_at = new Date();
    }

    await order.update(updateData);

    return successResponse(res, order, "更新订单状态成功");
  } catch (error) {
    console.error("更新订单状态错误:", error);
    return errorResponse(res, "更新订单状态失败");
  }
};

// 删除订单（管理员）
const adminDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找订单
    const order = await Order.findByPk(id);

    if (!order) {
      return notFoundResponse(res, "订单不存在");
    }

    // 删除订单商品
    await OrderItem.destroy({ where: { order_id: id } });

    // 删除订单
    await order.destroy();

    return successResponse(res, null, "删除订单成功");
  } catch (error) {
    console.error("删除订单错误:", error);
    return errorResponse(res, "删除订单失败");
  }
};

// 获取销售数据（用于数据分析）
const getSalesData = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, include: [{ model: Product }] }],
      order: [["created_at", "DESC"]],
    });

    // 转换为前端需要的数据格式
    const salesData = orders.map((order) => ({
      id: order.id,
      user_id: order.user_id,
      amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      items: order.OrderItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.Product?.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    return successResponse(res, salesData, "获取销售数据成功");
  } catch (error) {
    console.error("获取销售数据错误:", error);
    return errorResponse(res, "获取销售数据失败");
  }
};

module.exports = {
  createOrder,
  payOrder,
  getOrders,
  getOrderById,
  getTracking,
  confirmReceipt,
  requestRefund,
  deleteOrder,
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  adminDeleteOrder,
  getSalesData,
};
