import { createRouter, createWebHashHistory } from "vue-router";

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
    },
    {
      path: "/kategoriler",
      name: "categories",
      component: CategoriesPage,
    },
    {
      path: "/urunler",
      name: "products",
      component: ProductsPage,
    },
    {
      path: "/urunler/:categoryId",
      name: "products-by-category",
      component: ProductsPage,
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
});

export default router;
