// API测试脚本
const axios = require("axios");

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 测试获取水果分类的产品
api
  .get("/products/category/1")
  .then((response) => {
    console.log("水果分类产品响应:", response.data);
  })
  .catch((error) => {
    console.error("获取水果分类产品失败:", error);
  });

// 测试获取蔬菜分类的产品
api
  .get("/products/category/2")
  .then((response) => {
    console.log("蔬菜分类产品响应:", response.data);
  })
  .catch((error) => {
    console.error("获取蔬菜分类产品失败:", error);
  });
