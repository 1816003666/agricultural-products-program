import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import OrderListPage from "../views/OrderListPage.vue";
import OrderDetailPage from "../views/OrderDetailPage.vue";
import AdminPage from "../views/AdminPage.vue";
import AdminDashboardPage from "../views/AdminDashboardPage.vue";
import AdminProductPage from "../views/AdminProductPage.vue";
import AdminAddProductPage from "../views/AdminAddProductPage.vue";
import AdminOrderPage from "../views/AdminOrderPage.vue";
import AdminUserPage from "../views/AdminUserPage.vue";
import AdminAnalyticsPage from "../views/AdminAnalyticsPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HomePage,
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
      ],
    },
  ],
});

export default router;
