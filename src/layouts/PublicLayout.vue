<template>
  <div class="shell">
    <header class="topbar">
      <div class="topbar-title">MEHLIKA</div>
    </header>

    <slot />

    <nav class="nav">
      <RouterLink to="/">Giris</RouterLink>
      <RouterLink to="/kategoriler">Kategoriler</RouterLink>
      <RouterLink to="/urunler">Urunler</RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>
