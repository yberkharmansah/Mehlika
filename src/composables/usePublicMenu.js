import { computed, onMounted, ref } from "vue";

import {
  categories as fallbackCategories,
  products as fallbackProducts,
  venue,
} from "../data/menu";
import { isFirebaseConfigured } from "../lib/firebase";
import { fetchCategories, fetchProducts } from "../services/menuService";

const categories = ref([...fallbackCategories]);
const products = ref([...fallbackProducts]);
const loading = ref(false);
let loaded = false;

export function usePublicMenu() {
  async function loadMenu() {
    if (loaded || !isFirebaseConfigured) return;

    loading.value = true;
    try {
      const [remoteCategories, remoteProducts] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);

      if (remoteCategories.length) {
        categories.value = remoteCategories.filter((item) => item.isActive !== false);
      }

      if (remoteProducts.length) {
        products.value = remoteProducts.filter((item) => item.isActive !== false);
      }

      loaded = true;
    } catch (error) {
      console.error("Firebase menu okunamadi, yerel veri kullaniliyor.", error);
    } finally {
      loading.value = false;
    }
  }

  onMounted(loadMenu);

  return {
    venue,
    categories: computed(() => categories.value),
    products: computed(() => products.value),
    featuredProducts: computed(() =>
      [...products.value]
        .filter((item) => item.isFeatured)
        .sort((a, b) => Number(a.featuredOrder ?? 999) - Number(b.featuredOrder ?? 999))
    ),
    loading: computed(() => loading.value),
    refresh: loadMenu,
  };
}
