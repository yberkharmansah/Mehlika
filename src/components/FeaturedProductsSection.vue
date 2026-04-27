<template>
  <section v-if="products.length" class="panel featured-panel">
    <div class="section-title">
      <div>
        <p class="eyebrow">One Cikanlar</p>
        <h2>Mehlika Imzalari</h2>
      </div>
      <p>Misafirlerin en cok tercih ettigi ve Mehlika ruhunu en net tasiyan seckiler.</p>
    </div>

    <div class="featured-grid">
      <article
        v-for="product in products"
        :key="product.id"
        class="featured-card"
      >
        <div class="featured-card-media">
          <img :src="product.image" :alt="product.name" />
        </div>
        <div class="featured-card-body">
          <div class="featured-card-head">
            <div>
              <p class="featured-chip">One Cikan</p>
              <h3>{{ product.name }}</h3>
            </div>
            <strong>{{ product.price }}</strong>
          </div>
          <p>{{ product.description }}</p>
          <RouterLink class="category-button" :to="`/urunler/${product.category}`">
            Kategoride Gor
          </RouterLink>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  products: {
    type: Array,
    default: () => [],
  },
});
</script>
