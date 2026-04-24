<template>
  <article class="product-card">
    <div class="product-media">
      <img :src="product.image" :alt="product.name" />
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
defineProps({
  product: {
    type: Object,
    required: true,
  },
});
</script>
