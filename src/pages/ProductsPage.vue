<template>
  <main class="page">
    <PageHeading
      eyebrow="Urunler"
      :title="headingTitle"
      :subtitle="headingSubtitle"
    />

    <section class="filters-panel">
      <div class="filters-heading">
        <p class="eyebrow">Hizli Gecis</p>
        <span>Kategoriler arasinda kaydirarak gezin.</span>
      </div>

      <div class="filters">
        <RouterLink
          class="filter"
          :class="{ active: selectedCategoryId === 'all' }"
          to="/urunler"
        >
          Tum Menu
        </RouterLink>

        <RouterLink
          v-for="category in categories"
          :key="category.id"
          class="filter"
          :class="{ active: selectedCategoryId === category.id }"
          :to="`/urunler/${category.id}`"
        >
          {{ category.name }}
        </RouterLink>
      </div>
    </section>

    <section class="products">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </section>
  </main>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

import PageHeading from "../components/PageHeading.vue";
import ProductCard from "../components/ProductCard.vue";
import { categories, products } from "../data/menu";

const route = useRoute();

const selectedCategoryId = computed(() => route.params.categoryId ?? "all");

const selectedCategory = computed(() =>
  categories.find((category) => category.id === selectedCategoryId.value) ?? null
);

const headingTitle = computed(() =>
  selectedCategory.value ? selectedCategory.value.name : "Tum Menu"
);

const headingSubtitle = computed(() =>
  selectedCategory.value
    ? selectedCategory.value.description
    : "Mehlika'nin tum seckisini tek akista inceleyin."
);

const filteredProducts = computed(() => {
  if (selectedCategoryId.value === "all") {
    return products;
  }

  return products.filter((product) => product.category === selectedCategoryId.value);
});
</script>
