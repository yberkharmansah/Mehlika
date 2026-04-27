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

      <div ref="filterStrip" class="filters">
        <RouterLink
          class="filter"
          :class="{ active: selectedCategoryId === 'all' }"
          to="/urunler"
        >
          Tum Menu
        </RouterLink>

        <RouterLink
          class="filter"
          :class="{ active: selectedCategoryId === 'featured' }"
          to="/urunler/featured"
        >
          One Cikanlar
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
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { usePublicMenu } from "../composables/usePublicMenu";
import PageHeading from "../components/PageHeading.vue";
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();
const { categories, products, featuredProducts } = usePublicMenu();
const filterStrip = ref(null);

const selectedCategoryId = computed(() => route.params.categoryId ?? "all");

const selectedCategory = computed(() =>
  categories.value.find((category) => category.id === selectedCategoryId.value) ?? null
);

const headingTitle = computed(() => {
  if (selectedCategoryId.value === "featured") return "One Cikanlar";
  return selectedCategory.value ? selectedCategory.value.name : "Tum Menu";
});

const headingSubtitle = computed(() => {
  if (selectedCategoryId.value === "featured") {
    return "Kategorilerinden bagimsiz olarak ayrica one cikarilan Mehlika secimleri.";
  }

  return selectedCategory.value
    ? selectedCategory.value.description
    : "Mehlika'nin tum seckisini tek akista inceleyin.";
});

const filteredProducts = computed(() => {
  if (selectedCategoryId.value === "all") {
    return products.value;
  }

  if (selectedCategoryId.value === "featured") {
    return featuredProducts.value;
  }

  return products.value.filter((product) => product.category === selectedCategoryId.value);
});

function scrollActiveFilterIntoView() {
  nextTick(() => {
    const container = filterStrip.value;
    if (!container) return;

    const activeFilter = container.querySelector(".filter.active");
    if (!activeFilter) return;

    activeFilter.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  });
}

onMounted(scrollActiveFilterIntoView);
watch(selectedCategoryId, scrollActiveFilterIntoView);
</script>
