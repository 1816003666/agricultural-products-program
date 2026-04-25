import axios from "axios";

// 创建axios实例
const api = axios.create({
  baseURL: "https://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // 允许自签名证书（仅开发环境）
  httpsAgent: process.env.NODE_ENV === 'development' ? new (require('https').Agent)({ rejectUnauthorized: false }) : undefined,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 处理401未授权
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // 不打印错误信息，避免控制台显示错误
        // console.log("未授权，请登录");
      }
    }
    return Promise.reject(error);
  },
);

// 认证相关API
export const authAPI = {
  // 注册
  register: (data) => api.post("/auth/register", data),
  // 管理员注册
  registerAdmin: (data) => api.post("/auth/register", data),
  // 登录
  login: (data) => api.post("/auth/login", data),
  // 获取用户信息
  getProfile: () => api.get("/auth/profile"),
};

// 产品相关API
export const productAPI = {
  // 获取产品列表
  getProducts: (params) => api.get("/products", { params }),
  // 获取产品详情
  getProductById: (id) => api.get(`/products/${id}`),
  // 按分类获取产品
  getProductsByCategory: (categoryId) =>
    api.get(`/products/category/${categoryId}`),
  // 搜索产品
  searchProducts: (query) =>
    api.get("/products/search", { params: { q: query } }),
  // 添加产品
  addProduct: (data) => api.post("/products", data),
  // 更新产品
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  // 删除产品
  deleteProduct: (id) => api.delete(`/products/${id}`),
  // 获取产品数据（用于数据分析）
  getProductData: () => api.get("/products/data/analytics"),
};

// 购物车相关API
export const cartAPI = {
  // 获取购物车
  getCart: () => api.get("/cart"),
  // 添加商品到购物车
  addToCart: (data) => api.post("/cart", data),
  // 更新购物车商品
  updateCartItem: (id, data) => api.put(`/cart/${id}`, data),
  // 删除购物车商品
  removeCartItem: (id) => api.delete(`/cart/${id}`),
};

// 订单相关API
export const orderAPI = {
  // 创建订单
  createOrder: (data) => api.post("/orders", data),
  // 获取订单列表
  getOrders: (params) => api.get("/orders", { params }),
  // 获取订单详情
  getOrderById: (id) => api.get(`/orders/${id}`),
  // 获取物流信息
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
  // 支付订单
  payOrder: (id) => api.put(`/orders/${id}/pay`),
  // 确认收货
  confirmReceipt: (id) => api.put(`/orders/${id}/confirm`),
  // 申请退款
  requestRefund: (id) => api.put(`/orders/${id}/refund`),
  // 删除订单
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  // 获取所有订单列表（管理员）
  getAllOrders: (params) => api.get("/orders/admin/list", { params }),
  // 获取订单详情（管理员）
  getOrderDetail: (id) => api.get(`/orders/admin/${id}`),
  // 更新订单状态（管理员）
  updateOrderStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data),
  // 删除订单（管理员）
  adminDeleteOrder: (id) => api.delete(`/orders/admin/${id}`),
  // 获取销售数据（用于数据分析）
  getSalesData: () => api.get("/orders/data/analytics"),
};

// 用户相关API
export const userAPI = {
  // 获取地址列表
  getAddresses: () => api.get("/users/addresses"),
  // 创建地址
  createAddress: (data) => api.post("/users/addresses", data),
  // 更新地址
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  // 删除地址
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  // 获取浏览记录
  getHistory: (params) => api.get("/users/history", { params }),
  // 添加浏览记录
  addHistory: (data) => api.post("/users/history", data),
  // 清空浏览记录
  clearHistory: () => api.delete("/users/history"),
  // 获取用户列表（管理员）
  getUsers: () => api.get("/users"),
  // 获取用户详情（管理员）
  getUserById: (id) => api.get(`/users/${id}`),
  // 更新用户状态（管理员）
  updateUserStatus: (id, data) => api.put(`/users/${id}/status`, data),
  // 删除用户（管理员）
  deleteUser: (id) => api.delete(`/users/${id}`),
  // 获取用户数据（用于数据分析）
  getUserData: () => api.get("/users/data/analytics"),
};

// 评价相关API
export const reviewAPI = {
  // 创建评价
  createReview: (data) => api.post("/reviews", data),
  // 获取商品的所有评价
  getProductReviews: (productId, params) =>
    api.get(`/reviews/product/${productId}`, { params }),
  // 获取当前用户的评价列表
  getUserReviews: (params) => api.get("/reviews/user", { params }),
  // 管理员获取所有评价
  getAllReviews: (params) => api.get("/reviews/admin/list", { params }),
  // 管理员审核评价
  updateReviewStatus: (id, data) => api.put(`/reviews/${id}/status`, data),
  // 删除评价
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// 收藏相关API
export const favoriteAPI = {
  // 添加收藏
  addFavorite: (productId) => api.post("/favorites", { productId }),
  // 取消收藏
  removeFavorite: (productId) => api.delete(`/favorites/${productId}`),
  // 获取用户收藏列表
  getFavorites: (params) => api.get("/favorites", { params }),
  // 检查商品是否已收藏
  checkFavorite: (productId) => api.get(`/favorites/check/${productId}`),
  // 批量检查收藏状态
  batchCheckFavorites: (productIds) =>
    api.post("/favorites/batch-check", { productIds }),
};

// 优惠券相关API
export const couponAPI = {
  // 管理员创建优惠券
  createCoupon: (data) => api.post("/coupons", data),
  // 管理员获取优惠券列表
  getCoupons: (params) => api.get("/coupons/admin/list", { params }),
  // 用户领取优惠券
  claimCoupon: (couponId) => api.post("/coupons/claim", { couponId }),
  // 用户通过优惠券码领取
  claimCouponByCode: (code) => api.post("/coupons/claim-by-code", { code }),
  // 获取用户的优惠券列表
  getUserCoupons: (params) => api.get("/coupons/user", { params }),
  // 验证优惠券
  validateCoupon: (data) => api.post("/coupons/validate", data),
  // 使用优惠券
  useCoupon: (data) => api.post("/coupons/use", data),
  // 管理员更新优惠券
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  // 管理员删除优惠券
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};

// 物流相关API
export const logisticsAPI = {
  // 获取物流信息
  getTracking: (orderId) => api.get(`/logistics/${orderId}`),
  // 管理员更新物流信息
  updateTracking: (orderId, data) => api.put(`/logistics/${orderId}`, data),
  // 获取物流公司列表
  getLogisticsCompanies: () => api.get("/logistics/companies/list"),
  // 模拟物流轨迹更新（管理员使用）
  simulateTrace: (data) => api.post("/logistics/simulate", data),
};

// 操作日志相关API
export const operationLogAPI = {
  // 获取操作日志列表
  getLogs: (params) => api.get("/operation-logs", { params }),
  // 获取操作类型统计
  getActionStats: () => api.get("/operation-logs/stats"),
  // 获取日志详情
  getLogById: (id) => api.get(`/operation-logs/${id}`),
  // 删除日志
  deleteLog: (id) => api.delete(`/operation-logs/${id}`),
  // 清空日志
  clearLogs: (data) => api.delete("/operation-logs", { data }),
};

// 支付相关API
export const paymentAPI = {
  // 获取可用的支付方式
  getPaymentMethods: () => api.get("/payment/methods"),
  // 创建支付订单
  createPayment: (data) => api.post("/payment/create", data),
  // 查询支付状态
  getPaymentStatus: (orderId) => api.get(`/payment/status/${orderId}`),
};

// 限时折扣相关API
export const flashSaleAPI = {
  // 获取当前有效的限时折扣活动
  getActiveFlashSales: () => api.get("/flash-sale/active"),
  // 获取限时折扣活动详情
  getFlashSaleById: (id) => api.get(`/flash-sale/${id}`),
};

// 促销规则相关API
export const salesRuleAPI = {
  // 获取当前有效的促销规则
  getActiveSalesRules: () => api.get("/sales-rule/active"),
  // 应用促销规则计算优惠
  applySalesRule: (orderAmount) => api.post("/sales-rule/apply", { orderAmount }),
};

export default api;
