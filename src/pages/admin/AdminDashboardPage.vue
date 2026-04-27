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
  </main>
</template>

<script setup>
import { onMounted } from "vue";

import { useAdminMenu } from "../../composables/useAdminMenu";
import { useAuth } from "../../composables/useAuth";

const { categories, products, load } = useAdminMenu();
const { isFirebaseConfigured } = useAuth();

onMounted(load);
</script>
