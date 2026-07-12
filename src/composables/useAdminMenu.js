import { computed, ref } from "vue";

import { categories as fallbackCategories, products as fallbackProducts } from "../data/menu";
import { venue } from "../data/menu";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  publishMenuSnapshot,
  replaceMenuCatalog,
  replaceCategoryOrder,
  replaceProductOrder,
  updateCategory,
  updateProduct,
  deleteUploadedMenuImage,
  uploadMenuImage,
} from "../services/menuService";

const categories = ref([]);
const products = ref([]);
const loading = ref(false);
const saving = ref(false);
const loaded = ref(false);
const lastError = ref("");

function formatAdminError(error) {
  const code = error?.code ?? "";

  if (code === "permişsion-denied") {
    return "Firebase yazma izni reddedildi. Admin hesabı ile giriş yaptığından ve e-posta doğrulamanın tamamlandığından emin ol.";
  }

  if (code === "unauthenticated") {
    return "Bu işlem için yeniden admin girişi yapman gerekiyor.";
  }

  return error?.message ?? "Beklenmeyen bir hata oluştu.";
}

function setLastError(error) {
  lastError.value = formatAdminError(error);
  console.error(error);
}

function normalizeCategories(items) {
  return items.map((item, index) => ({
    ...item,
    docId: item.docId ?? item.id,
    itemCount: Number(item.itemCount ?? 0),
    sortOrder: Number(item.sortOrder ?? index + 1),
    isActive: item.isActive !== false,
  }));
}

function normalizeProducts(items) {
  return items.map((item, index) => ({
    ...item,
    tags: Array.isArray(item.tags) ? item.tags : [],
    sortOrder: Number(item.sortOrder ?? index + 1),
    featuredOrder: Number(item.featuredOrder ?? 0),
    isFeatured: item.isFeatured === true,
    isActive: item.isActive !== false,
  }));
}

export function useAdminMenu() {
  function clearError() {
    lastError.value = "";
  }

  async function publishCurrentMenu() {
    saving.value = true;
    clearError();
    try {
      await publishMenuSnapshot({
        venue,
        categories: categories.value,
        products: products.value,
      });
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function load() {
    if (loaded.value) return;

    loading.value = true;
    clearError();
    try {
      const [remoteCategories, remoteProducts] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);

      categories.value = normalizeCategories(
        remoteCategories.length ? remoteCategories : fallbackCategories
      );
      products.value = normalizeProducts(
        remoteProducts.length ? remoteProducts : fallbackProducts
      );
      loaded.value = true;
    } catch (error) {
      setLastError(error);
    } finally {
      loading.value = false;
    }
  }

  async function createCategoryRecord(payload) {
    saving.value = true;
    clearError();
    try {
      await createCategory({
        ...payload,
        sortOrder: categories.value.length + 1,
        itemCount: Number(payload.itemCount ?? 0),
      });
      loaded.value = false;
      await load();
      await publishCurrentMenu();
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function saveCategoryRecord(id, payload) {
    saving.value = true;
    clearError();
    try {
      const target = categories.value.find((item) => item.id === id || item.docId === id);
      await updateCategory(target?.docId ?? id, payload);
      await publishCurrentMenu();
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function removeCategoryRecord(id) {
    saving.value = true;
    clearError();
    try {
      const target = categories.value.find((item) => item.id === id || item.docId === id);
      await deleteCategory(target?.docId ?? id);
      categories.value = categories.value.filter((item) => item.id !== id);
      await publishCurrentMenu();
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function createProductRecord(payload) {
    saving.value = true;
    clearError();
    try {
      await createProduct({
        ...payload,
        sortOrder: products.value.length + 1,
      });
      loaded.value = false;
      await load();
      await publishCurrentMenu();
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function saveProductRecord(id, payload) {
    saving.value = true;
    clearError();
    try {
      await updateProduct(id, payload);
      await publishCurrentMenu();
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function removeProductRecord(id) {
    saving.value = true;
    clearError();
    try {
      await deleteProduct(id);
      products.value = products.value.filter((item) => item.id !== id);
      await publishCurrentMenu();
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function moveCategory(id, direction) {
    clearError();
    const index = categories.value.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= categories.value.length) return;
    const next = [...categories.value];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    categories.value = normalizeCategories(next);
    try {
      await replaceCategoryOrder(categories.value);
      await publishCurrentMenu();
    } catch (error) {
      setLastError(error);
    }
  }

  async function moveProduct(id, direction) {
    clearError();
    const index = products.value.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= products.value.length) return;
    const next = [...products.value];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    products.value = normalizeProducts(next);
    try {
      await replaceProductOrder(products.value);
      await publishCurrentMenu();
    } catch (error) {
      setLastError(error);
    }
  }

  async function uploadImage(file, folder) {
    saving.value = true;
    clearError();
    try {
      return await uploadMenuImage(file, folder);
    } catch (error) {
      setLastError(error);
      return null;
    } finally {
      saving.value = false;
    }
  }

  async function tryDeleteUploadedImage(deleteToken) {
    try {
      await deleteUploadedMenuImage(deleteToken);
    } catch (error) {
      console.warn("Cloudinary dosyası silinemedi veya token süresi doldu.", error);
    }
  }

  async function replaceCatalog(payload) {
    saving.value = true;
    clearError();
    try {
      await replaceMenuCatalog(payload);
      loaded.value = false;
      await load();
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function clearAllCategoryImages() {
    saving.value = true;
    clearError();
    try {
      const targets = categories.value.filter(
        (item) => item.image || item.cloudinaryDeleteToken || item.cloudinaryPublicId
      );

      await Promise.all(
        targets.map(async (category) => {
          if (category.cloudinaryDeleteToken) {
            await tryDeleteUploadedImage(category.cloudinaryDeleteToken);
          }

          await updateCategory(category.docId ?? category.id, {
            ...category,
            image: "",
            cloudinaryPublicId: "",
            cloudinaryDeleteToken: "",
          });
        })
      );

      categories.value = normalizeCategories(
        categories.value.map((category) => ({
          ...category,
          image: "",
          cloudinaryPublicId: "",
          cloudinaryDeleteToken: "",
        }))
      );

      await publishMenuSnapshot({
        venue,
        categories: categories.value,
        products: products.value,
      });

      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function clearAllProductImages() {
    saving.value = true;
    clearError();
    try {
      const targets = products.value.filter(
        (item) => item.image || item.cloudinaryDeleteToken || item.cloudinaryPublicId
      );

      await Promise.all(
        targets.map(async (product) => {
          if (product.cloudinaryDeleteToken) {
            await tryDeleteUploadedImage(product.cloudinaryDeleteToken);
          }

          await updateProduct(product.id, {
            ...product,
            image: "",
            cloudinaryPublicId: "",
            cloudinaryDeleteToken: "",
          });
        })
      );

      products.value = normalizeProducts(
        products.value.map((product) => ({
          ...product,
          image: "",
          cloudinaryPublicId: "",
          cloudinaryDeleteToken: "",
        }))
      );

      await publishMenuSnapshot({
        venue,
        categories: categories.value,
        products: products.value,
      });

      return true;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  return {
    categories: computed(() => categories.value),
    products: computed(() => products.value),
    loading: computed(() => loading.value),
    saving: computed(() => saving.value),
    lastError: computed(() => lastError.value),
    clearError,
    load,
    createCategoryRecord,
    saveCategoryRecord,
    removeCategoryRecord,
    createProductRecord,
    saveProductRecord,
    removeProductRecord,
    moveCategory,
    moveProduct,
    uploadImage,
    tryDeleteUploadedImage,
    replaceCatalog,
    publishCurrentMenu,
    clearAllCategoryImages,
    clearAllProductImages,
  };
}
