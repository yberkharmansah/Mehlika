<template>
  <section v-if="products.length" class="panel featured-panel">
    <div class="section-title">
      <div>
        <p class="eyebrow">Öne Çıkanlar</p>
        <h2>Mehlika İmzaları</h2>
      </div>
      <p>Misafirlerin en çok tercih ettiği ve Mehlika ruhunu en net taşıyan seçkiler.</p>
    </div>

    <div class="featured-grid">
      <article
        v-for="product in products"
        :key="product.id"
        class="featured-card"
      >
        <div class="featured-card-media">
          <img
            :src="getImageAttrs(product.image).src"
            :srcset="getImageAttrs(product.image).srcset"
            :sizes="getImageAttrs(product.image).sizes"
            :alt="product.name"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="featured-card-body">
          <div class="featured-card-head">
            <div>
              <p class="featured-chip">Öne Çıkan</p>
              <h3>{{ product.name }}</h3>
            </div>
            <strong>{{ product.price }}</strong>
          </div>
          <p>{{ product.description }}</p>
          <RouterLink class="category-button" :to="`/urunler/${product.category}`">
            Kategoride Gör
          </RouterLink>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { getResponsiveImageAttrs } from "../services/cloudinaryService";

defineProps({
  products: {
    type: Array,
    default: () => [],
  },
});

function getImageAttrs(url) {
  return getResponsiveImageAttrs(url, {
    width: 960,
    height: 600,
    fit: "fill",
    sizes: "(max-width: 720px) 100vw, 50vw",
  });
}
</script>
