import { computed, onMounted, ref } from "vue";

import {
  categories as fallbackCategories,
  products as fallbackProducts,
  venue as fallbackVenue,
} from "../data/menu";
import { isFirebaseConfigured } from "../lib/firebase";
import { fetchCategories, fetchProducts, fetchPublishedMenu } from "../services/menuService";

const PUBLIC_MENU_CACHE_KEY = "mehlika-public-menu-cache-v1";

function hasCatalogData(menu) {
  return Boolean(menu?.categories?.length || menu?.products?.length);
}

function cachePublicMenu(menu) {
  if (typeof window === "undefined" || !hasCatalogData(menu)) return;
  window.localStorage.setItem(PUBLIC_MENU_CACHE_KEY, JSON.stringify(menu));
}

function readCachedMenu() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PUBLIC_MENU_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return hasCatalogData(parsed) ? parsed : null;
  } catch (error) {
    console.warn("Önbellekteki public menü verisi okunamadı.", error);
    return null;
  }
}

const initialCachedMenu = readCachedMenu();
const categories = ref(initialCachedMenu?.categories ?? [...fallbackCategories]);
const products = ref(initialCachedMenu?.products ?? [...fallbackProducts]);
const venue = ref(initialCachedMenu?.venue ?? { ...fallbackVenue });
const loading = ref(false);
let loaded = hasCatalogData(initialCachedMenu);
let pendingLoad = null;

function isUsableAssetPath(value) {
  if (!value || typeof value !== "string") return false;

  const normalized = value.trim();
  if (!normalized) return false;
  if (normalized === "/" || normalized.endsWith("/")) return false;

  return normalized.startsWith("http://")
    || normalized.startsWith("https://")
    || normalized.startsWith("/");
}

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
      logo: isUsableAssetPath(publishedVenue.logo) ? publishedVenue.logo : fallbackVenue.logo,
      slogan: publishedVenue.slogan || fallbackVenue.slogan,
      note: publishedVenue.note || fallbackVenue.note,
      hours: fallbackVenue.hours || publishedVenue.hours,
      links: Array.isArray(publishedVenue.links) && publishedVenue.links.length
        ? publishedVenue.links
        : fallbackVenue.links,
    },
    categories: normalizedCategories,
    products: normalizedProducts,
  };
}

function normalizeCollectionCategories(items = []) {
  return items
    .filter((item) => item.isActive !== false)
    .map((category, index) => ({
      id: category.id ?? category.slug ?? `category-${index + 1}`,
      name: category.name ?? "",
      accent: category.accent ?? "",
      description: category.description ?? "",
      image: category.imageUrl ?? category.image ?? "",
      itemCount: Number(category.itemCount ?? 0),
      isActive: category.isActive !== false,
      sortOrder: Number(category.sortOrder ?? index + 1),
    }));
}

function normalizeCollectionProducts(items = []) {
  return items
    .filter((item) => item.isActive !== false)
    .map((product, index) => ({
      id: product.id ?? `product-${index + 1}`,
      category: product.category ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price ?? "",
      image: product.imageUrl ?? product.image ?? "",
      tags: Array.isArray(product.tags) ? product.tags : [],
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured === true,
      featuredOrder: Number(product.featuredOrder ?? 0),
      sortOrder: Number(product.sortOrder ?? index + 1),
    }));
}

function applyMenuState(menu) {
  venue.value = menu.venue;
  categories.value = menu.categories;
  products.value = menu.products;
  loaded = hasCatalogData(menu);
}

function currentMenuState() {
  return {
    venue: venue.value,
    categories: categories.value,
    products: products.value,
  };
}

async function buildMenuState() {
  const publishedMenu = await fetchPublishedMenu();

  if (publishedMenu) {
    const normalizedMenu = normalizePublishedMenu(publishedMenu);
    const hasPublishedCatalog = normalizedMenu.categories.length > 0 || normalizedMenu.products.length > 0;

    if (hasPublishedCatalog) {
      return {
        ...normalizedMenu,
        isComplete: true,
      };
    }
  }

  const [remoteCategories, remoteProducts] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
  ]);

  const normalizedCategories = normalizeCollectionCategories(remoteCategories);
  const normalizedProducts = normalizeCollectionProducts(remoteProducts);

  return {
    venue: { ...fallbackVenue },
    categories: normalizedCategories,
    products: normalizedProducts,
    isComplete: normalizedCategories.length > 0 || normalizedProducts.length > 0,
  };
}

export function usePublicMenu() {
  async function loadMenu({ force = false } = {}) {
    if ((loaded && !force) || !isFirebaseConfigured) return;
    if (pendingLoad && !force) return pendingLoad;

    loading.value = true;
    pendingLoad = (async () => {
      try {
        const normalizedMenu = await buildMenuState();
        if (normalizedMenu.isComplete) {
          applyMenuState(normalizedMenu);
          cachePublicMenu(normalizedMenu);
        } else if (!hasCatalogData(currentMenuState())) {
          applyMenuState(normalizedMenu);
        }
      } catch (error) {
        console.error("Firebase menu okunamadi, yerel veri kullaniliyor.", error);
        if (!hasCatalogData(currentMenuState())) {
          const cachedMenu = readCachedMenu();
          if (cachedMenu) {
            applyMenuState(cachedMenu);
          }
        }
      } finally {
        const cachedMenu = readCachedMenu();
        if (!hasCatalogData(currentMenuState()) && cachedMenu) {
          applyMenuState(cachedMenu);
        }
        pendingLoad = null;
        loading.value = false;
      }
    })();

    return pendingLoad;
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
