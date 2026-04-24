import { createRouter, createWebHistory } from "vue-router";

import CategoriesPage from "../pages/CategoriesPage.vue";
import HomePage from "../pages/HomePage.vue";
import ProductsPage from "../pages/ProductsPage.vue";

const router = createRouter({
  history: createWebHistory(),
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
