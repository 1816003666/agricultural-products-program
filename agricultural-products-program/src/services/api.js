import axios from "axios";

// 创建axios实例
const api = axios.create({
  baseURL: "http://localhost:3002/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
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

export default api;
