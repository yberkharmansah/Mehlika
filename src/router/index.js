import { createRouter, createWebHashHistory } from "vue-router";
import { auth, authReadyPromise, isFirebaseConfigured } from "../lib/firebase";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.vue";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage.vue";
import AdminLoginPage from "../pages/admin/AdminLoginPage.vue";
import AdminProductsPage from "../pages/admin/AdminProductsPage.vue";
import CategoriesPage from "../pages/CategoriesPage.vue";
import HomePage from "../pages/HomePage.vue";
import ProductsPage from "../pages/ProductsPage.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage,
      meta: { layout: "public" },
    },
    {
      path: "/kategoriler",
      name: "categories",
      component: CategoriesPage,
      meta: { layout: "public" },
    },
    {
      path: "/urunler",
      name: "products",
      component: ProductsPage,
      meta: { layout: "public" },
    },
    {
      path: "/urunler/:categoryId",
      name: "products-by-category",
      component: ProductsPage,
      meta: { layout: "public" },
    },
    {
      path: "/admin/login",
      name: "admin-login",
      component: AdminLoginPage,
      meta: { layout: "auth" },
    },
    {
      path: "/admin",
      name: "admin-dashboard",
      component: AdminDashboardPage,
      meta: { layout: "admin", requiresAuth: true },
    },
    {
      path: "/admin/kategoriler",
      name: "admin-categories",
      component: AdminCategoriesPage,
      meta: { layout: "admin", requiresAuth: true },
    },
    {
      path: "/admin/urunler",
      name: "admin-products",
      component: AdminProductsPage,
      meta: { layout: "admin", requiresAuth: true },
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  if (!isFirebaseConfigured) return { name: "admin-login" };
  await authReadyPromise;
  if (!auth?.currentUser) {
    return { name: "admin-login", query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
