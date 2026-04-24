<template>
  <RouterLink
    class="category-card"
    :class="{ alt: reverse }"
    :to="`/urunler/${category.id}`"
  >
    <div class="category-media">
      <img :src="category.image" :alt="category.name" />
    </div>

    <div class="category-content">
      <div class="category-copy">
        <span class="chip">{{ category.accent }}</span>
        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>
      </div>

      <div class="category-meta">{{ category.itemCount }} urun</div>
      <span class="category-button">MENUYU GOR</span>
    </div>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  category: {
    type: Object,
    required: true,
  },
  reverse: {
    type: Boolean,
    default: false,
  },
});
</script>
