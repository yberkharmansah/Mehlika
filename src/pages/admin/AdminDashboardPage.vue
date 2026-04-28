<template>
  <main class="admin-page">
    <section class="admin-page-header">
      <div>
        <p class="admin-kicker">Genel Bakis</p>
        <h2>Menu Durumu</h2>
      </div>
      <p>Panelden kategori ve urunleri guncelleyebilir, sira duzenini degistirebilir ve gorsel yukleyebilirsin.</p>
    </section>

    <div v-if="!isFirebaseConfigured" class="admin-alert admin-alert-warning">
      Firebase ayarlari eksik. CRUD islemleri aktif olmayacak.
    </div>

    <div v-if="lastError" class="admin-alert admin-alert-warning">
      {{ lastError }}
    </div>

    <div class="admin-stats">
      <article class="admin-stat-card">
        <span>Kategori</span>
        <strong>{{ categories.length }}</strong>
      </article>

      <article class="admin-stat-card">
        <span>Urun</span>
        <strong>{{ products.length }}</strong>
      </article>

      <article class="admin-stat-card">
        <span>Veri Kaynagi</span>
        <strong>{{ isFirebaseConfigured ? "Firebase" : "Yerel" }}</strong>
      </article>
    </div>

    <section class="admin-form-card">
      <div class="admin-page-header admin-page-header-compact">
        <div>
          <p class="admin-kicker">Public Menu</p>
          <h2>Yayin Durumu</h2>
        </div>
        <p>Musteri QR menusu artik tek bir published menu dokumani uzerinden acilir.</p>
      </div>

      <div class="admin-form-actions">
        <button
          class="admin-primary-button"
          type="button"
          :disabled="saving || !isFirebaseConfigured"
          @click="publishMenu"
        >
          Menuyu Yayinla
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from "vue";

import { useAdminMenu } from "../../composables/useAdminMenu";
import { useAuth } from "../../composables/useAuth";

const { categories, products, load, saving, lastError, publishCurrentMenu } = useAdminMenu();
const { isFirebaseConfigured } = useAuth();

onMounted(load);

async function publishMenu() {
  const success = await publishCurrentMenu();
  if (success) {
    window.alert("Public menu dokumani guncellendi.");
  }
}
</script>
