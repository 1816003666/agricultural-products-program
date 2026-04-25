const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const Address = require("../models/Address");

// 模拟物流信息
const mockLogisticsData = {
  SF: {
    name: "顺丰速运",
    website: "https://www.sf-express.com",
  },
  YTO: {
    name: "圆通速递",
    website: "https://www.yto.net.cn",
  },
  ZTO: {
    name: "中通快递",
    website: "https://www.zto.com",
  },
  STO: {
    name: "申通快递",
    website: "https://www.sto.cn",
  },
  JD: {
    name: "京东物流",
    website: "https://www.jdwl.com",
  },
};

// 生成模拟物流轨迹
const generateMockTrace = (trackingNumber) => {
  const now = new Date();
  const traces = [];

  // 已发货
  traces.push({
    time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "已发货",
    location: "商家仓库",
    description: "商品已从商家仓库发出",
  });

  // 运输中
  traces.push({
    time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "运输中",
    location: "杭州中转站",
    description: "商品到达杭州中转站",
  });

  traces.push({
    time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "运输中",
    location: "上海分拨中心",
    description: "商品到达上海分拨中心",
  });

  // 派送中
  traces.push({
    time: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    status: "派送中",
    location: "上海虹口区站点",
    description: "商品正在派送中，请保持手机畅通",
  });

  // 最新状态
  traces.push({
    time: now.toISOString(),
    status: "派送中",
    location: "上海虹口区",
    description: "快递员正在为您派送",
  });

  return traces;
};

// 获取物流信息
exports.getTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, UserId: userId },
      include: [{ model: OrderItem, include: [Product] }, { model: Address }],
    });

    if (!order) {
      return res.status(404).json({ message: "订单不存在" });
    }

    // 检查订单是否已支付
    if (order.status === "pending") {
      return res.status(400).json({ message: "订单未支付，无法查看物流" });
    }

    // 如果没有物流单号，生成一个模拟的
    if (!order.tracking_number) {
      // 模拟生成物流单号
      const logisticsCompanies = Object.keys(mockLogisticsData);
      const company =
        logisticsCompanies[
          Math.floor(Math.random() * logisticsCompanies.length)
        ];
      const number = `${company}${Date.now()}`.substring(0, 18);

      order.tracking_number = number;
      order.shipping_company = mockLogisticsData[company].name;
      await order.save();
    }

    // 获取物流轨迹
    const traces = generateMockTrace(order.tracking_number);

    // 获取当前物流状态
    const currentTrace = traces[traces.length - 1];

    const trackingInfo = {
      orderId: order.id,
      trackingNumber: order.tracking_number,
      shippingCompany: order.shipping_company || "未知",
      status:
        order.status === "delivered"
          ? "已签收"
          : order.status === "paid"
            ? "运输中"
            : "待发货",
      receiver: {
        name: order.Address?.name,
        phone: order.Address?.phone,
        address: order.Address
          ? `${order.Address.province}${order.Address.city}${order.Address.district}${order.Address.detail}`
          : "",
      },
      currentLocation: currentTrace.location,
      lastUpdate: currentTrace.time,
      traces: traces,
      estimatedDelivery:
        order.status === "delivered"
          ? null
          : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    res.json({ tracking: trackingInfo });
  } catch (error) {
    console.error("获取物流信息失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 管理员更新物流信息
exports.updateTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, shippingCompany, status, location, description } =
      req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "订单不存在" });
    }

    if (trackingNumber) order.tracking_number = trackingNumber;
    if (shippingCompany) order.shipping_company = shippingCompany;
    if (status) order.status = status;

    await order.save();

    res.json({ message: "物流信息更新成功", order });
  } catch (error) {
    console.error("更新物流信息失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取支持的物流公司列表
exports.getLogisticsCompanies = async (req, res) => {
  try {
    const companies = Object.entries(mockLogisticsData).map(([code, info]) => ({
      code,
      name: info.name,
      website: info.website,
    }));

    res.json({ companies });
  } catch (error) {
    console.error("获取物流公司列表失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 模拟物流轨迹更新（管理员使用）
exports.simulateTrace = async (req, res) => {
  try {
    const { orderId, status, location, description } = req.body;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "订单不存在" });
    }

    // 这里可以添加更复杂的物流轨迹逻辑
    // 目前只是简单更新订单状态
    if (status) {
      order.status = status;
      await order.save();
    }

    res.json({
      message: "物流轨迹更新成功",
      order: {
        id: order.id,
        tracking_number: order.tracking_number,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("模拟物流轨迹更新失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
