import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import CategoryPage from "../views/CategoryPage.vue";
import SearchPage from "../views/SearchPage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import OrderListPage from "../views/OrderListPage.vue";
import OrderDetailPage from "../views/OrderDetailPage.vue";
import FavoritesPage from "../views/FavoritesPage.vue";
import CouponsPage from "../views/CouponsPage.vue";
import TrackingPage from "../views/TrackingPage.vue";
import ReviewsPage from "../views/ReviewsPage.vue";
import AdminLoginPage from "../views/AdminLoginPage.vue";
import AdminPage from "../views/AdminPage.vue";
import AdminDashboardPage from "../views/AdminDashboardPage.vue";
import AdminProductPage from "../views/AdminProductPage.vue";
import AdminAddProductPage from "../views/AdminAddProductPage.vue";
import AdminOrderPage from "../views/AdminOrderPage.vue";
import AdminUserPage from "../views/AdminUserPage.vue";
import AdminAnalyticsPage from "../views/AdminAnalyticsPage.vue";
import AdminReviewsPage from "../views/AdminReviewsPage.vue";
import AdminLogsPage from "../views/AdminLogsPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HomePage,
    },
    {
      path: "/category/:category",
      component: CategoryPage,
    },
    {
      path: "/search",
      component: SearchPage,
    },
    {
      path: "/profile",
      component: ProfilePage,
    },
    {
      path: "/orders",
      component: OrderListPage,
    },
    {
      path: "/order/:id",
      component: OrderDetailPage,
    },
    {
      path: "/favorites",
      component: FavoritesPage,
    },
    {
      path: "/coupons",
      component: CouponsPage,
    },
    {
      path: "/tracking",
      component: TrackingPage,
    },
    {
      path: "/reviews",
      component: ReviewsPage,
    },
    {
      path: "/admin/login",
      component: AdminLoginPage,
    },
    {
      path: "/admin",
      component: AdminPage,
      children: [
        {
          path: "",
          component: AdminDashboardPage,
        },
        {
          path: "products",
          component: AdminProductPage,
        },
        {
          path: "products/add",
          component: AdminAddProductPage,
        },
        {
          path: "orders",
          component: AdminOrderPage,
        },
        {
          path: "users",
          component: AdminUserPage,
        },
        {
          path: "analytics",
          component: AdminAnalyticsPage,
        },
        {
          path: "reviews",
          component: AdminReviewsPage,
        },
        {
          path: "logs",
          component: AdminLogsPage,
        },
      ],
    },
  ],
});

// 路由守卫：检查管理员登录状态
router.beforeEach((to, from) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // 如果访问管理后台且未登录，跳转到登录页面
  if (to.path.startsWith("/admin") && to.path !== "/admin/login") {
    if (!token || !user) {
      return "/admin/login";
    }

    try {
      const userData = JSON.parse(user);
      // 检查用户角色是否为管理员
      if (userData.role !== "admin") {
        return "/admin/login";
      }
    } catch (e) {
      return "/admin/login";
    }
  }

  // 如果已登录并访问登录页面，跳转到管理后台首页
  if (to.path === "/admin/login" && token && user) {
    try {
      const userData = JSON.parse(user);
      if (userData.role === "admin") {
        return "/admin";
      }
    } catch (e) {
      // 忽略错误，继续到登录页
    }
  }

  return true;
});

export default router;
