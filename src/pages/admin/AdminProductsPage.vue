<template>
  <main class="admin-page">
    <section class="admin-page-header">
      <div>
        <p class="admin-kicker">Urunler</p>
        <h2>Urun Yonetimi</h2>
      </div>
      <p>Fiyat, aciklama, etiketler, kategori baglantisi ve gorseller bu alandan guncellenir.</p>
    </section>

    <div v-if="lastError" class="admin-alert admin-alert-warning">
      {{ lastError }}
    </div>

    <section class="admin-toolbar-panel">
      <label class="admin-field">
        <span>Urun Ara</span>
        <input
          v-model.trim="searchTerm"
          type="search"
          placeholder="Latte, limonata, serpme..."
        />
      </label>
      <label class="admin-field">
        <span>Kategori Filtresi</span>
        <select v-model="selectedCategoryFilter">
          <option value="all">Tum Kategoriler</option>
          <option value="featured">Sadece One Cikanlar</option>
          <option
            v-for="category in categories"
            :key="`filter-${category.id}`"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </label>
    </section>

    <section class="admin-form-card">
      <div class="admin-page-header admin-page-header-compact">
        <div>
          <p class="admin-kicker">One Cikanlar</p>
          <h2>Vitrin Secimi</h2>
        </div>
        <p>Mevcut urunlerden ara, one cikar ve ana sayfadaki vitrine ekle.</p>
      </div>

      <div class="featured-picker">
        <article
          v-for="product in filteredProducts"
          :key="`featured-${product.id}`"
          class="featured-picker-card"
        >
          <div class="featured-picker-media">
            <img v-if="product.image" :src="product.image" :alt="product.name" />
          </div>
          <div class="featured-picker-body">
            <div>
              <h3>{{ product.name }}</h3>
              <p>{{ categoryName(product.category) }} - {{ product.price }}</p>
            </div>
            <div class="admin-form-actions">
              <button
                class="admin-ghost-button"
                type="button"
                :disabled="saving"
                @click="toggleFeatured(product)"
              >
                {{ product.isFeatured ? "One Cikani Kaldir" : "One Cikan Yap" }}
              </button>
              <label v-if="product.isFeatured" class="admin-field">
                <span>Sira</span>
                <input
                  :value="product.featuredOrder"
                  type="number"
                  min="1"
                  @input="patch(product.id, 'featuredOrder', toNumber($event.target.value, 1))"
                />
              </label>
              <button
                class="admin-primary-button"
                type="button"
                :disabled="saving"
                @click="save(product)"
              >
                Vitrini Kaydet
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <form class="admin-form-card" @submit.prevent="handleCreate">
      <div class="admin-form-grid">
        <label class="admin-field">
          <span>Urun Adi</span>
          <input v-model.trim="draft.name" type="text" />
        </label>
        <label class="admin-field">
          <span>Kategori</span>
          <select v-model="draft.category">
            <option disabled value="">Sec</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </label>
        <label class="admin-field">
          <span>Fiyat</span>
          <input v-model.trim="draft.price" type="text" />
        </label>
        <label class="admin-field admin-field-full">
          <span>Aciklama</span>
          <textarea v-model.trim="draft.description" rows="3"></textarea>
        </label>
        <label class="admin-field admin-field-full">
          <span>Etiketler</span>
          <input v-model.trim="draft.tagsInput" type="text" placeholder="Ozel Harman, En Cok Tercih Edilen" />
        </label>
        <label class="admin-field">
          <span>One Cikan</span>
          <select v-model="draft.isFeatured">
            <option :value="false">Hayir</option>
            <option :value="true">Evet</option>
          </select>
        </label>
        <label class="admin-field">
          <span>One Cikan Sirasi</span>
          <input v-model.number="draft.featuredOrder" type="number" min="0" />
        </label>
        <label class="admin-field">
          <span>Gorsel URL</span>
          <input v-model.trim="draft.image" type="url" />
        </label>
        <label class="admin-field">
          <span>Gorsel Yukle</span>
          <input type="file" accept="image/*" @change="openCropper($event, 'draft')" />
        </label>
      </div>
      <div class="admin-form-actions">
        <button
          v-if="draft.image"
          class="admin-ghost-button"
          type="button"
          @click="clearDraftImage"
        >
          Gorseli Kaldir
        </button>
        <button class="admin-primary-button" type="submit" :disabled="saving">Urun Ekle</button>
      </div>
    </form>

    <section class="admin-list">
      <article v-for="product in filteredProducts" :key="product.id" class="admin-list-card">
        <div class="admin-list-media">
          <img v-if="product.image" :src="product.image" :alt="product.name" />
        </div>
        <div class="admin-list-body">
          <div class="admin-list-head">
            <div>
              <p v-if="product.isFeatured" class="admin-chip">ONE CIKAN - {{ product.featuredOrder || "-" }}</p>
              <h3>{{ product.name }}</h3>
              <p class="admin-price">{{ product.price }}</p>
            </div>
            <div class="admin-order-controls">
              <button class="admin-icon-button" type="button" @click="moveProduct(product.id, -1)">Yukari</button>
              <button class="admin-icon-button" type="button" @click="moveProduct(product.id, 1)">Asagi</button>
            </div>
          </div>
          <div class="admin-form-grid">
            <label class="admin-field">
              <span>Baslik</span>
              <input :value="product.name" @input="patch(product.id, 'name', $event.target.value)" />
            </label>
            <label class="admin-field">
              <span>Kategori</span>
              <select :value="product.category" @change="patch(product.id, 'category', $event.target.value)">
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </label>
            <label class="admin-field">
              <span>Fiyat</span>
              <input :value="product.price" @input="patch(product.id, 'price', $event.target.value)" />
            </label>
            <label class="admin-field admin-field-full">
              <span>Aciklama</span>
              <textarea :value="product.description" rows="3" @input="patch(product.id, 'description', $event.target.value)"></textarea>
            </label>
            <label class="admin-field admin-field-full">
              <span>Etiketler</span>
              <input :value="(product.tags || []).join(', ')" @input="patch(product.id, 'tags', $event.target.value.split(',').map((item) => item.trim()).filter(Boolean))" />
            </label>
            <label class="admin-field">
              <span>One Cikan</span>
              <select :value="product.isFeatured" @change="patch(product.id, 'isFeatured', $event.target.value === 'true')">
                <option :value="false">Hayir</option>
                <option :value="true">Evet</option>
              </select>
            </label>
            <label class="admin-field">
              <span>One Cikan Sirasi</span>
              <input :value="product.featuredOrder" type="number" min="0" @input="patch(product.id, 'featuredOrder', toNumber($event.target.value, 0))" />
            </label>
            <label class="admin-field admin-field-full">
              <span>Gorsel URL</span>
              <input :value="product.image" @input="patch(product.id, 'image', $event.target.value)" />
            </label>
            <label class="admin-field admin-field-full">
              <span>Gorsel Degistir</span>
              <input type="file" accept="image/*" @change="openCropper($event, 'existing', product.id)" />
            </label>
          </div>
          <div class="admin-form-actions">
            <button class="admin-ghost-button" type="button" :disabled="saving" @click="clearExistingImage(product)">
              Gorseli Kaldir
            </button>
            <button class="admin-primary-button" type="button" :disabled="saving" @click="save(product)">Kaydet</button>
            <button class="admin-danger-button" type="button" :disabled="saving" @click="removeProductRecord(product.id)">Sil</button>
          </div>
        </div>
      </article>
    </section>

    <ImageCropperModal
      :open="cropper.open"
      :src="cropper.src"
      :file-name="cropper.fileName"
      :aspect-ratio="1.6"
      title="Urun gorselini duzenle"
      @close="closeCropper"
      @confirm="handleCropConfirm"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

import ImageCropperModal from "../../components/ImageCropperModal.vue";
import { useAdminMenu } from "../../composables/useAdminMenu";

const {
  categories,
  products,
  load,
  saving,
  createProductRecord,
  saveProductRecord,
  removeProductRecord,
  moveProduct,
  uploadImage,
  tryDeleteUploadedImage,
  lastError,
} = useAdminMenu();

const draft = reactive({
  name: "",
  category: "",
  price: "",
  description: "",
  image: "",
  tagsInput: "",
  isActive: true,
  cloudinaryPublicId: "",
  cloudinaryDeleteToken: "",
  isFeatured: false,
  featuredOrder: 0,
});

const cropper = reactive({
  open: false,
  src: "",
  fileName: "product.jpg",
  target: "draft",
  targetId: "",
});

const searchTerm = ref("");
const selectedCategoryFilter = ref("all");

onMounted(load);

const filteredProducts = computed(() => {
  let results = products.value;

  if (selectedCategoryFilter.value === "featured") {
    results = results.filter((product) => product.isFeatured);
  } else if (selectedCategoryFilter.value !== "all") {
    results = results.filter((product) => product.category === selectedCategoryFilter.value);
  }

  if (!searchTerm.value) return results;

  const query = searchTerm.value.toLowerCase();
  return results.filter((product) =>
    [
      product.name,
      product.description,
      product.price,
      categoryName(product.category),
      ...(product.tags || []),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  );
});

function patch(id, field, value) {
  const target = products.value.find((item) => item.id === id);
  if (target) target[field] = value;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function categoryName(categoryId) {
  const match = categories.value.find((item) => item.id === categoryId);
  return match?.name ?? "Kategori Yok";
}

function nextFeaturedOrder() {
  const orders = products.value
    .filter((item) => item.isFeatured)
    .map((item) => Number(item.featuredOrder ?? 0));
  return (Math.max(0, ...orders) || 0) + 1;
}

function toggleFeatured(product) {
  const enabled = !product.isFeatured;
  product.isFeatured = enabled;
  product.featuredOrder = enabled ? nextFeaturedOrder() : 0;
}

async function handleCreate() {
  await createProductRecord({
    ...draft,
    tags: draft.tagsInput.split(",").map((item) => item.trim()).filter(Boolean),
  });
  draft.name = "";
  draft.category = "";
  draft.price = "";
  draft.description = "";
  draft.image = "";
  draft.tagsInput = "";
  draft.cloudinaryPublicId = "";
  draft.cloudinaryDeleteToken = "";
  draft.isFeatured = false;
  draft.featuredOrder = 0;
}

function openCropper(event, target, targetId = "") {
  const [file] = event.target.files || [];
  if (!file) return;
  cropper.open = true;
  cropper.src = URL.createObjectURL(file);
  cropper.fileName = file.name;
  cropper.target = target;
  cropper.targetId = targetId;
  event.target.value = "";
}

function closeCropper() {
  cropper.open = false;
  cropper.src = "";
  cropper.fileName = "product.jpg";
  cropper.target = "draft";
  cropper.targetId = "";
}

async function handleCropConfirm(file) {
  const uploaded = await uploadImage(file, "mehlika/products");
  if (!uploaded) {
    closeCropper();
    return;
  }

  if (cropper.target === "draft") {
    draft.image = uploaded.url;
    draft.cloudinaryPublicId = uploaded.publicId || "";
    draft.cloudinaryDeleteToken = uploaded.deleteToken || "";
  } else {
    const target = products.value.find((item) => item.id === cropper.targetId);
    if (target) {
      if (target.cloudinaryDeleteToken) {
        await tryDeleteUploadedImage(target.cloudinaryDeleteToken);
      }
      target.image = uploaded.url;
      target.cloudinaryPublicId = uploaded.publicId || "";
      target.cloudinaryDeleteToken = uploaded.deleteToken || "";
    }
  }

  closeCropper();
}

async function save(product) {
  await saveProductRecord(product.id, product);
}

function clearDraftImage() {
  draft.image = "";
  draft.cloudinaryPublicId = "";
  draft.cloudinaryDeleteToken = "";
}

async function clearExistingImage(product) {
  if (product.cloudinaryDeleteToken) {
    await tryDeleteUploadedImage(product.cloudinaryDeleteToken);
  }
  product.image = "";
  product.cloudinaryPublicId = "";
  product.cloudinaryDeleteToken = "";
}
</script>
