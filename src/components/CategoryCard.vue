<template>
  <RouterLink
    class="category-card"
    :class="{ alt: reverse }"
    :to="`/urunler/${category.id}`"
  >
    <div class="category-media">
      <img
        v-if="category.image"
        :src="imageAttrs.src"
        :srcset="imageAttrs.srcset"
        :sizes="imageAttrs.sizes"
        :alt="category.name"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="category-placeholder">
        <span>{{ category.name }}</span>
      </div>
    </div>

    <div class="category-content">
      <div class="category-copy">
        <span class="chip">{{ category.accent }}</span>
        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>
      </div>

      <div class="category-meta">{{ category.itemCount || 0 }} ürün</div>
      <span class="category-button">MENÜYÜ GÖR</span>
    </div>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { computed } from "vue";
import { getResponsiveImageAttrs } from "../services/cloudinaryService";

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
  reverse: {
    type: Boolean,
    default: false,
  },
});

const imageAttrs = computed(() =>
  getResponsiveImageAttrs(props.category.image, {
    width: 960,
    height: 600,
    fit: "fill",
    sizes: "(max-width: 720px) 100vw, 50vw",
  })
);
</script>
