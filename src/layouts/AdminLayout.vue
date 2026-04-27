<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div>
        <p class="admin-kicker">Mehlika Panel</p>
        <h1>Yonetim</h1>
      </div>

      <nav class="admin-nav">
        <RouterLink to="/admin">Genel Bakis</RouterLink>
        <RouterLink to="/admin/kategoriler">Kategoriler</RouterLink>
        <RouterLink to="/admin/urunler">Urunler</RouterLink>
      </nav>

      <div class="admin-sidebar-footer">
        <p>Firebase tabanli menu yonetimi</p>
        <button class="admin-ghost-button" type="button" @click="handleLogout">
          Cikis Yap
        </button>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <div>
          <p class="admin-kicker">Admin</p>
          <strong>Menu Kontrol Merkezi</strong>
        </div>
      </header>

      <slot />
    </div>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from "vue-router";

import { logoutUser } from "../services/authService";

const router = useRouter();

async function handleLogout() {
  await logoutUser();
  router.push("/admin/login");
}
</script>
