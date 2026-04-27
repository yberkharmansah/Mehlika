<template>
  <section class="hero hero-centered">
    <img class="hero-logo" :src="venue.logo" :alt="`${venue.name} logo`" />
    <p class="eyebrow">Mehlika Cafe</p>
    <h1>{{ venue.name }}</h1>
    <p class="tagline">{{ venue.slogan }}</p>
    <div class="hero-line"></div>
    <p class="hero-note">{{ venue.note }}</p>

    <div class="cta-row">
      <RouterLink class="button" to="/kategoriler">Menuyu Kesfet</RouterLink>
      <RouterLink class="ghost-button" to="/urunler/featured">One Cikanlar</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  venue: {
    type: Object,
    required: true,
  },
});
</script>
