import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db, isFirebaseConfigured } from "../lib/firebase";
import { venue as defaultVenue } from "../data/menu";
import { deleteImageByToken, uploadImageToCloudinary } from "./mediaService";

const COLLECTIONS = {
  categories: "categories",
  products: "products",
  publishedMenus: "publishedMenus",
};

function ensureFirebase() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase ayarlari eksik. .env dosyasini doldurup tekrar dene.");
  }
}

function withTimestamps(payload, isNew = false) {
  return {
    ...payload,
    updatedAt: serverTimestamp(),
    ...(isNew ? { createdAt: serverTimestamp() } : {}),
  };
}

function withoutId(payload) {
  if (!payload || typeof payload !== "object") return payload;
  const { id, docId, ...rest } = payload;
  return rest;
}

function toCategorySlug(name = "") {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/&/g, "ve")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortByOrder(items = [], field = "sortOrder") {
  return [...items].sort((left, right) => Number(left[field] ?? 9999) - Number(right[field] ?? 9999));
}

function buildPublishedMenuPayload({
  venue = defaultVenue,
  categories = [],
  products = [],
}) {
  const activeCategories = sortByOrder(
    categories.filter((item) => item.isActive !== false),
    "sortOrder"
  );
  const activeProducts = sortByOrder(
    products.filter((item) => item.isActive !== false),
    "sortOrder"
  );

  return {
    restaurantId: venue.id,
    restaurantName: venue.name,
    slug: venue.slug,
    venue: {
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      slogan: venue.slogan,
      note: venue.note,
      hours: venue.hours,
      logo: venue.logo,
      links: venue.links,
    },
    categories: activeCategories.map((category) => {
      const categoryProducts = activeProducts
        .filter((product) => product.category === category.id)
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          currency: "TRY",
          imageUrl: product.image ?? "",
          image: product.image ?? "",
          tags: Array.isArray(product.tags) ? product.tags : [],
          isActive: product.isActive !== false,
          isFeatured: product.isFeatured === true,
          featuredOrder: Number(product.featuredOrder ?? 0),
          order: Number(product.sortOrder ?? 0),
          sortOrder: Number(product.sortOrder ?? 0),
          category: product.category,
        }));

      return {
        id: category.id,
        slug: category.id,
        name: category.name,
        accent: category.accent ?? "",
        description: category.description ?? "",
        image: category.image ?? "",
        imageUrl: category.image ?? "",
        itemCount: categoryProducts.length,
        isActive: category.isActive !== false,
        order: Number(category.sortOrder ?? 0),
        sortOrder: Number(category.sortOrder ?? 0),
        products: categoryProducts,
      };
    }),
  };
}

export async function fetchCategories() {
  ensureFirebase();
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.categories), orderBy("sortOrder", "asc"))
  );
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      ...data,
      id: data.slug ?? data.id ?? toCategorySlug(data.name),
      docId: entry.id,
    };
  });
}

export async function fetchProducts() {
  ensureFirebase();
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.products), orderBy("sortOrder", "asc"))
  );
  return snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }));
}

export async function fetchPublishedMenu(restaurantId = defaultVenue.id) {
  ensureFirebase();
  const snapshot = await getDoc(doc(db, COLLECTIONS.publishedMenus, restaurantId));
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createCategory(payload) {
  ensureFirebase();
  return addDoc(
    collection(db, COLLECTIONS.categories),
    withTimestamps(
      {
        ...withoutId(payload),
        slug: payload.id ?? payload.slug ?? toCategorySlug(payload.name),
      },
      true
    )
  );
}

export async function updateCategory(id, payload) {
  ensureFirebase();
  const targetDocId = payload?.docId ?? id;
  const stableSlug = payload?.slug ?? payload?.id ?? toCategorySlug(payload?.name);
  return updateDoc(
    doc(db, COLLECTIONS.categories, targetDocId),
    withTimestamps({
      ...withoutId(payload),
      slug: stableSlug,
    })
  );
}

export async function deleteCategory(id) {
  ensureFirebase();
  return deleteDoc(doc(db, COLLECTIONS.categories, id));
}

export async function createProduct(payload) {
  ensureFirebase();
  return addDoc(
    collection(db, COLLECTIONS.products),
    withTimestamps(withoutId(payload), true)
  );
}

export async function updateProduct(id, payload) {
  ensureFirebase();
  return updateDoc(doc(db, COLLECTIONS.products, id), withTimestamps(withoutId(payload)));
}

export async function deleteProduct(id) {
  ensureFirebase();
  return deleteDoc(doc(db, COLLECTIONS.products, id));
}

async function clearCollection(name) {
  const snapshot = await getDocs(collection(db, name));
  await Promise.all(snapshot.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function replaceMenuCatalog({ categories = [], products = [] }) {
  ensureFirebase();
  await clearCollection(COLLECTIONS.products);
  await clearCollection(COLLECTIONS.categories);

  const itemCountByCategory = products.reduce((accumulator, product) => {
    accumulator[product.category] = (accumulator[product.category] ?? 0) + 1;
    return accumulator;
  }, {});

  await Promise.all(
    categories.map((category, index) =>
      addDoc(
        collection(db, COLLECTIONS.categories),
        withTimestamps(
          {
            ...withoutId(category),
            slug: category.id ?? category.slug ?? toCategorySlug(category.name),
            itemCount: Number(itemCountByCategory[category.id] ?? category.itemCount ?? 0),
            image: category.image ?? "",
            isActive: category.isActive !== false,
            sortOrder: index + 1,
          },
          true
        )
      )
    )
  );

  await Promise.all(
    products.map((product, index) =>
      addDoc(
        collection(db, COLLECTIONS.products),
        withTimestamps(
          {
            ...withoutId(product),
            image: product.image ?? "",
            tags: Array.isArray(product.tags) ? product.tags : [],
            isActive: product.isActive !== false,
            isFeatured: product.isFeatured === true,
            featuredOrder: Number(product.featuredOrder ?? 0),
            sortOrder: index + 1,
          },
          true
        )
      )
    )
  );

  await publishMenuSnapshot({
    venue: defaultVenue,
    categories,
    products,
  });
}

export async function replaceCategoryOrder(categories) {
  ensureFirebase();
  await Promise.all(
    categories.map((category, index) =>
      setDoc(
        doc(db, COLLECTIONS.categories, category.docId ?? category.id),
        withTimestamps({
          ...withoutId(category),
          slug: category.slug ?? category.id ?? toCategorySlug(category.name),
          sortOrder: index + 1,
        }),
        { merge: true }
      )
    )
  );
}

export async function replaceProductOrder(products) {
  ensureFirebase();
  await Promise.all(
    products.map((product, index) =>
      setDoc(
        doc(db, COLLECTIONS.products, product.id),
        withTimestamps({ ...product, sortOrder: index + 1 }),
        { merge: true }
      )
    )
  );
}

export async function publishMenuSnapshot({
  venue = defaultVenue,
  categories = [],
  products = [],
} = {}) {
  ensureFirebase();
  const publishedPayload = buildPublishedMenuPayload({ venue, categories, products });
  await setDoc(
    doc(db, COLLECTIONS.publishedMenus, venue.id ?? defaultVenue.id),
    withTimestamps(publishedPayload, true),
    { merge: true }
  );
  return publishedPayload;
}

export async function uploadMenuImage(file, folder = "menu") {
  return uploadImageToCloudinary(file, folder);
}

export async function deleteUploadedMenuImage(deleteToken) {
  return deleteImageByToken(deleteToken);
}
