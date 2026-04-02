const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../utils/response");

// 获取购物车
const getCart = async (req, res) => {
  try {
    // 检查用户是否登录
    let cart = null;
    if (req.user) {
      const userId = req.user.id;
      // 查找用户的购物车
      cart = await Cart.findOne({ where: { user_id: userId } });

      // 如果购物车不存在，创建一个
      if (!cart) {
        cart = await Cart.create({ user_id: userId });
      }
    } else {
      // 未登录用户，返回空购物车
      return successResponse(
        res,
        {
          cart_id: null,
          items: [],
          total_amount: 0,
        },
        "获取购物车成功",
      );
    }

    // 获取购物车商品
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Product }],
    });

    // 计算总金额
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.Product.price * item.quantity;
    }, 0);

    return successResponse(
      res,
      {
        cart_id: cart.id,
        items: cartItems,
        total_amount: totalAmount,
      },
      "获取购物车成功",
    );
  } catch (error) {
    console.error("获取购物车错误:", error);
    return errorResponse(res, "获取购物车失败");
  }
};

// 添加商品到购物车
const addToCart = async (req, res) => {
  try {
    // 检查用户是否登录
    if (!req.user) {
      // 未登录用户，返回错误信息
      return errorResponse(res, "请先登录");
    }

    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    // 查找用户的购物车
    let cart = await Cart.findOne({ where: { user_id: userId } });

    // 如果购物车不存在，创建一个
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    // 检查商品是否存在
    const product = await Product.findByPk(product_id);
    if (!product) {
      return notFoundResponse(res, "商品不存在");
    }

    // 检查商品库存
    if (product.stock < quantity) {
      return errorResponse(res, "商品库存不足");
    }

    // 检查购物车中是否已有该商品
    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id },
    });

    if (cartItem) {
      // 如果商品已存在，更新数量
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // 如果商品不存在，添加到购物车
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity,
      });
    }

    // 获取更新后的购物车
    const updatedCartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Product }],
    });

    // 计算总金额
    const totalAmount = updatedCartItems.reduce((total, item) => {
      return total + item.Product.price * item.quantity;
    }, 0);

    return successResponse(
      res,
      {
        cart_id: cart.id,
        items: updatedCartItems,
        total_amount: totalAmount,
      },
      "添加商品到购物车成功",
    );
  } catch (error) {
    console.error("添加商品到购物车错误:", error);
    return errorResponse(res, "添加商品到购物车失败");
  }
};

// 更新购物车商品
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // 查找用户的购物车
    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return notFoundResponse(res, "购物车不存在");
    }

    // 查找购物车商品
    const cartItem = await CartItem.findOne({
      where: { id, cart_id: cart.id },
    });
    if (!cartItem) {
      return notFoundResponse(res, "购物车商品不存在");
    }

    // 检查商品库存
    const product = await Product.findByPk(cartItem.product_id);
    if (product.stock < quantity) {
      return errorResponse(res, "商品库存不足");
    }

    // 更新数量
    cartItem.quantity = quantity;
    await cartItem.save();

    // 获取更新后的购物车
    const updatedCartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Product }],
    });

    // 计算总金额
    const totalAmount = updatedCartItems.reduce((total, item) => {
      return total + item.Product.price * item.quantity;
    }, 0);

    return successResponse(
      res,
      {
        cart_id: cart.id,
        items: updatedCartItems,
        total_amount: totalAmount,
      },
      "更新购物车商品成功",
    );
  } catch (error) {
    console.error("更新购物车商品错误:", error);
    return errorResponse(res, "更新购物车商品失败");
  }
};

// 删除购物车商品
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 查找用户的购物车
    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return notFoundResponse(res, "购物车不存在");
    }

    // 查找购物车商品
    const cartItem = await CartItem.findOne({
      where: { id, cart_id: cart.id },
    });
    if (!cartItem) {
      return notFoundResponse(res, "购物车商品不存在");
    }

    // 删除商品
    await cartItem.destroy();

    // 获取更新后的购物车
    const updatedCartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Product }],
    });

    // 计算总金额
    const totalAmount = updatedCartItems.reduce((total, item) => {
      return total + item.Product.price * item.quantity;
    }, 0);

    return successResponse(
      res,
      {
        cart_id: cart.id,
        items: updatedCartItems,
        total_amount: totalAmount,
      },
      "删除购物车商品成功",
    );
  } catch (error) {
    console.error("删除购物车商品错误:", error);
    return errorResponse(res, "删除购物车商品失败");
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
