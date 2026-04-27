<template>
  <main class="admin-page">
    <section class="admin-page-header">
      <div>
        <p class="admin-kicker">Kategoriler</p>
        <h2>Kategori Yonetimi</h2>
      </div>
      <p>Baslik, aciklama, vurgu metni, gorsel ve liste sirasini tek ekranda yonet.</p>
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
          placeholder="Kahve, tatli, kahvalti..."
        />
      </label>
    </section>

    <form class="admin-form-card" @submit.prevent="handleCreate">
      <div class="admin-form-grid">
        <label class="admin-field">
          <span>Kategori Adi</span>
          <input v-model.trim="draft.name" type="text" placeholder="Sicak Kahveler" />
        </label>
        <label class="admin-field">
          <span>Vurgu Metni</span>
          <input v-model.trim="draft.accent" type="text" placeholder="KLASIK LEZZETLER" />
        </label>
        <label class="admin-field admin-field-full">
          <span>Aciklama</span>
          <textarea v-model.trim="draft.description" rows="3"></textarea>
        </label>
        <label class="admin-field">
          <span>Gorsel URL</span>
          <input v-model.trim="draft.image" type="url" placeholder="https://..." />
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
        <button class="admin-primary-button" type="submit" :disabled="saving">Kategori Ekle</button>
      </div>
    </form>

    <section class="admin-list">
      <article v-for="category in filteredCategories" :key="category.id" class="admin-list-card">
        <div class="admin-list-media">
          <img v-if="category.image" :src="category.image" :alt="category.name" />
        </div>
        <div class="admin-list-body">
          <div class="admin-list-head">
            <div>
              <p class="admin-chip">{{ category.accent }}</p>
              <h3>{{ category.name }}</h3>
            </div>
            <div class="admin-order-controls">
              <button class="admin-icon-button" type="button" @click="moveCategory(category.id, -1)">Yukari</button>
              <button class="admin-icon-button" type="button" @click="moveCategory(category.id, 1)">Asagi</button>
            </div>
          </div>
          <div class="admin-form-grid">
            <label class="admin-field">
              <span>Baslik</span>
              <input :value="category.name" @input="patch(category.id, 'name', $event.target.value)" />
            </label>
            <label class="admin-field">
              <span>Vurgu</span>
              <input :value="category.accent" @input="patch(category.id, 'accent', $event.target.value)" />
            </label>
            <label class="admin-field admin-field-full">
              <span>Aciklama</span>
              <textarea :value="category.description" rows="3" @input="patch(category.id, 'description', $event.target.value)"></textarea>
            </label>
            <label class="admin-field admin-field-full">
              <span>Gorsel URL</span>
              <input :value="category.image" @input="patch(category.id, 'image', $event.target.value)" />
            </label>
            <label class="admin-field admin-field-full">
              <span>Gorsel Degistir</span>
              <input type="file" accept="image/*" @change="openCropper($event, 'existing', category.id)" />
            </label>
          </div>
          <div class="admin-form-actions">
            <button class="admin-ghost-button" type="button" :disabled="saving" @click="clearExistingImage(category)">
              Gorseli Kaldir
            </button>
            <button class="admin-primary-button" type="button" :disabled="saving" @click="save(category)">Kaydet</button>
            <button class="admin-danger-button" type="button" :disabled="saving" @click="removeCategoryRecord(category.id)">Sil</button>
          </div>
        </div>
      </article>
    </section>

    <ImageCropperModal
      :open="cropper.open"
      :src="cropper.src"
      :file-name="cropper.fileName"
      :aspect-ratio="1.6"
      title="Kategori gorselini duzenle"
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
  cropper.open = false;
  cropper.src = "";
  cropper.fileName = "category.jpg";
  cropper.target = "draft";
  cropper.targetId = "";
}

async function handleCropConfirm(file) {
  const uploaded = await uploadImage(file, "mehlika/categories");
  if (!uploaded) {
    closeCropper();
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

  closeCropper();
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
</script>
