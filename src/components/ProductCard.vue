<template>
  <article class="product-card">
    <div class="product-media">
      <img
        v-if="product.image"
        :src="imageAttrs.src"
        :srcset="imageAttrs.srcset"
        :sizes="imageAttrs.sizes"
        :alt="product.name"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="product-placeholder">
        <span>{{ product.name }}</span>
      </div>
      <span class="price-badge">{{ product.price }}</span>
    </div>

    <div class="product-body">
      <div class="product-head">
        <div>
          <h3>{{ product.name }}</h3>
          <p class="product-meta">{{ product.description }}</p>
        </div>
      </div>

      <div class="tags">
        <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { getResponsiveImageAttrs } from "../services/cloudinaryService";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const imageAttrs = computed(() =>
  getResponsiveImageAttrs(props.product.image, {
    width: 960,
    height: 600,
    fit: "fill",
    sizes: "(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw",
  })
);
</script>
