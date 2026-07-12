<template>
  <main class="admin-page">
    <section class="admin-page-header">
      <div>
        <p class="admin-kicker">Kategoriler</p>
        <h2>Kategori Yönetimi</h2>
      </div>
      <p>Başlık, açıklama, vurgu metni, görsel ve liste sırasını tek ekranda yönet.</p>
    </section>

    <div v-if="lastError" class="admin-alert admin-alert-warning">
      {{ lastError }}
    </div>

    <section class="admin-toolbar-panel">
      <label class="admin-field admin-field-full">
        <span>Kategori Ara</span>
        <input
          v-model.trim="searchTerm"
          type="search"
          placeholder="Kahve, tatlı, kahvaltı..."
        />
      </label>
      <div class="admin-form-actions">
        <button
          class="admin-danger-button"
          type="button"
          :disabled="saving || !hasAnyCategoryImage"
          @click="clearAllImages"
        >
          Mevcut Görselleri Temizle
        </button>
      </div>
    </section>

    <form class="admin-form-card" @submit.prevent="handleCreate">
      <div class="admin-form-grid">
        <label class="admin-field">
          <span>Kategori Adı</span>
          <input v-model.trim="draft.name" type="text" placeholder="Sıcak Kahveler" />
        </label>
        <label class="admin-field">
          <span>Vurgu Metni</span>
          <input v-model.trim="draft.accent" type="text" placeholder="KLASİK LEZZETLER" />
        </label>
        <label class="admin-field admin-field-full">
          <span>Açıklama</span>
          <textarea v-model.trim="draft.description" rows="3"></textarea>
        </label>
        <label class="admin-field">
          <span>Görsel URL</span>
          <input v-model.trim="draft.image" type="url" placeholder="https://..." />
        </label>
        <label class="admin-field">
          <span>Görsel Yükle</span>
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
          Görseli Kaldır
        </button>
        <button class="admin-primary-button" type="submit" :disabled="saving">Kategori Ekle</button>
      </div>
    </form>

    <section class="admin-list">
      <article v-for="category in filteredCategories" :key="category.id" class="admin-list-card">
        <div class="admin-list-media">
          <img v-if="showCategoryImages && category.image" :src="category.image" :alt="category.name" />
        </div>
        <div class="admin-list-body">
          <div class="admin-list-head">
            <div>
              <p class="admin-chip">{{ category.accent }}</p>
              <h3>{{ category.name }}</h3>
            </div>
            <div class="admin-order-controls">
              <button class="admin-icon-button" type="button" @click="moveCategory(category.id, -1)">Yukarı</button>
              <button class="admin-icon-button" type="button" @click="moveCategory(category.id, 1)">Aşağı</button>
            </div>
          </div>
          <div class="admin-form-grid">
            <label class="admin-field">
              <span>Başlık</span>
              <input :value="category.name" @input="patch(category.id, 'name', $event.target.value)" />
            </label>
            <label class="admin-field">
              <span>Vurgu</span>
              <input :value="category.accent" @input="patch(category.id, 'accent', $event.target.value)" />
            </label>
            <label class="admin-field admin-field-full">
              <span>Açıklama</span>
              <textarea :value="category.description" rows="3" @input="patch(category.id, 'description', $event.target.value)"></textarea>
            </label>
            <label class="admin-field admin-field-full">
              <span>Görsel URL</span>
              <input :value="category.image" @input="patch(category.id, 'image', $event.target.value)" />
            </label>
            <label class="admin-field admin-field-full">
              <span>Görsel Değiştir</span>
              <input type="file" accept="image/*" @change="openCropper($event, 'existing', category.id)" />
            </label>
          </div>
          <div class="admin-form-actions">
            <button class="admin-ghost-button" type="button" :disabled="saving" @click="clearExistingImage(category)">
              Görseli Kaldır
            </button>
            <button class="admin-primary-button" type="button" :disabled="saving" @click="save(category)">Kaydet</button>
            <button class="admin-danger-button" type="button" :disabled="saving" @click="removeCategoryRecord(category.id)">Sil</button>
          </div>
        </div>
      </article>
    </section>

    <ImageCropperModal
      :open="cropper.open"
      :busy="cropper.uploading"
      :src="cropper.src"
      :file-name="cropper.fileName"
      :aspect-ratio="1.6"
      title="Kategori görselini düzenle"
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
  load,
  saving,
  createCategoryRecord,
  saveCategoryRecord,
  removeCategoryRecord,
  moveCategory,
  uploadImage,
  tryDeleteUploadedImage,
  clearAllCategoryImages,
  lastError,
} = useAdminMenu();

const draft = reactive({
  name: "",
  accent: "",
  description: "",
  image: "",
  itemCount: 0,
  isActive: true,
  cloudinaryPublicId: "",
  cloudinaryDeleteToken: "",
});

const cropper = reactive({
  open: false,
  src: "",
  fileName: "category.jpg",
  target: "draft",
  targetId: "",
  uploading: false,
});

const searchTerm = ref("");

onMounted(load);

const filteredCategories = computed(() => {
  if (!searchTerm.value) return categories.value;

  const query = searchTerm.value.toLowerCase();
  return categories.value.filter((category) =>
    [category.name, category.accent, category.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  );
});

const showCategoryImages = computed(() => Boolean(searchTerm.value.trim()));

const hasAnyCategoryImage = computed(() =>
  categories.value.some((category) => category.image || category.cloudinaryPublicId || category.cloudinaryDeleteToken)
);

function patch(id, field, value) {
  const target = categories.value.find((item) => item.id === id);
  if (target) target[field] = value;
}

async function handleCreate() {
  await createCategoryRecord(draft);
  draft.name = "";
  draft.accent = "";
  draft.description = "";
  draft.image = "";
  draft.cloudinaryPublicId = "";
  draft.cloudinaryDeleteToken = "";
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
  if (cropper.uploading) return;
  cropper.open = false;
  cropper.src = "";
  cropper.fileName = "category.jpg";
  cropper.target = "draft";
  cropper.targetId = "";
  cropper.uploading = false;
}

async function handleCropConfirm(file) {
  if (cropper.uploading) return;
  cropper.uploading = true;

  try {
    const uploaded = await uploadImage(file, "mehlika/categories");
    if (!uploaded) {
      return;
    }

    if (cropper.target === "draft") {
      draft.image = uploaded.url;
      draft.cloudinaryPublicId = uploaded.publicId || "";
      draft.cloudinaryDeleteToken = uploaded.deleteToken || "";
    } else {
      const target = categories.value.find((item) => item.id === cropper.targetId);
      if (target) {
        if (target.cloudinaryDeleteToken) {
          await tryDeleteUploadedImage(target.cloudinaryDeleteToken);
        }
        target.image = uploaded.url;
        target.cloudinaryPublicId = uploaded.publicId || "";
        target.cloudinaryDeleteToken = uploaded.deleteToken || "";
      }
    }
  } finally {
    cropper.uploading = false;
    closeCropper();
  }
}

async function save(category) {
  await saveCategoryRecord(category.id, category);
}

function clearDraftImage() {
  draft.image = "";
  draft.cloudinaryPublicId = "";
  draft.cloudinaryDeleteToken = "";
}

async function clearExistingImage(category) {
  if (category.cloudinaryDeleteToken) {
    await tryDeleteUploadedImage(category.cloudinaryDeleteToken);
  }
  category.image = "";
  category.cloudinaryPublicId = "";
  category.cloudinaryDeleteToken = "";
}

async function clearAllImages() {
  const confirmed = window.confirm(
    "Tüm kategori görselleri temizlenecek ve public menüden kaldırılacak. Devam edilsin mi?"
  );
  if (!confirmed) return;

  await clearAllCategoryImages();
}
</script>
