<template>
  <section class="hero hero-centered">
    <img
      class="hero-logo"
      :src="currentLogo.src"
      :srcset="currentLogo.srcset"
      :sizes="currentLogo.sizes"
      :alt="`${venue.name} logo`"
      @error="handleLogoError"
    />
    <p class="eyebrow">Mehlika Cafe</p>
    <h1>{{ venue.name }}</h1>
    <p class="tagline">{{ venue.slogan }}</p>
    <div class="hero-line"></div>
    <p class="hero-note">{{ venue.note }}</p>

    <div class="cta-row">
      <RouterLink class="button" to="/kategoriler">Menüyü Keşfet</RouterLink>
      <RouterLink class="ghost-button" to="/urunler/featured">Öne Çıkanlar</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { getResponsiveImageAttrs } from "../services/cloudinaryService";

const props = defineProps({
  venue: {
    type: Object,
    required: true,
  },
});

const fallbackLogo = `${import.meta.env.BASE_URL}brand/logo.jpg`;
const logoErrored = ref(false);

const currentLogo = computed(() =>
  getResponsiveImageAttrs(logoErrored.value ? fallbackLogo : props.venue.logo || fallbackLogo, {
    width: 192,
    height: 192,
    fit: "fit",
    sizes: "96px",
    breakpoints: [96, 144, 192],
  })
);

watch(
  () => props.venue.logo,
  () => {
    logoErrored.value = false;
  }
);

function handleLogoError() {
  logoErrored.value = true;
}
</script>
