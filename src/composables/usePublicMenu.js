import { computed, onMounted, ref } from "vue";

import {
  categories as fallbackCategories,
  products as fallbackProducts,
  venue as fallbackVenue,
} from "../data/menu";
import { isFirebaseConfigured } from "../lib/firebase";
import { fetchPublishedMenu } from "../services/menuService";

const categories = ref([...fallbackCategories]);
const products = ref([...fallbackProducts]);
const venue = ref({ ...fallbackVenue });
const loading = ref(false);
let loaded = false;
const PUBLIC_MENU_CACHE_KEY = "mehlika-public-menu-v1";

function normalizePublishedMenu(menu) {
  const publishedVenue = menu?.venue ?? fallbackVenue;
  const publishedCategories = Array.isArray(menu?.categories) ? menu.categories : [];
  const normalizedCategories = publishedCategories
    .filter((item) => item.isActive !== false)
    .map((category, index) => ({
      id: category.id ?? category.slug ?? `category-${index + 1}`,
      name: category.name ?? "",
      accent: category.accent ?? "",
      description: category.description ?? "",
      image: category.imageUrl ?? category.image ?? "",
      itemCount: Number(category.itemCount ?? category.products?.length ?? 0),
      isActive: category.isActive !== false,
      sortOrder: Number(category.order ?? category.sortOrder ?? index + 1),
    }));

  const normalizedProducts = publishedCategories.flatMap((category, categoryIndex) =>
    (Array.isArray(category.products) ? category.products : [])
      .filter((item) => item.isActive !== false)
      .map((product, productIndex) => ({
        id: product.id ?? `${category.id}-product-${productIndex + 1}`,
        category: category.id ?? category.slug ?? `category-${categoryIndex + 1}`,
        name: product.name ?? "",
        description: product.description ?? "",
        price: product.price ?? "",
        image: product.imageUrl ?? product.image ?? "",
        tags: Array.isArray(product.tags) ? product.tags : [],
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured === true,
        featuredOrder: Number(product.featuredOrder ?? 0),
        sortOrder: Number(product.order ?? product.sortOrder ?? productIndex + 1),
      }))
  );

  return {
    venue: {
      ...fallbackVenue,
      ...publishedVenue,
    },
    categories: normalizedCategories,
    products: normalizedProducts,
  };
}

function readCachedMenu() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PUBLIC_MENU_CACHE_KEY);
    if (!raw) return null;
    return normalizePublishedMenu(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeCachedMenu(payload) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PUBLIC_MENU_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // cache best effort only
  }
}

const cachedMenu = readCachedMenu();
if (cachedMenu) {
  venue.value = cachedMenu.venue;
  categories.value = cachedMenu.categories;
  products.value = cachedMenu.products;
  loaded = true;
}

export function usePublicMenu() {
  async function loadMenu() {
    if (loaded || !isFirebaseConfigured) return;

    loading.value = true;
    try {
      const publishedMenu = await fetchPublishedMenu();

      if (publishedMenu) {
        const normalizedMenu = normalizePublishedMenu(publishedMenu);
        venue.value = normalizedMenu.venue;
        categories.value = normalizedMenu.categories;
        products.value = normalizedMenu.products;
        writeCachedMenu(publishedMenu);
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
    venue: computed(() => venue.value),
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
