<template>
  <main class="page">
    <PageHeading
      eyebrow="Kategoriler"
      title="Mehlika Seckisi"
      subtitle="Zarif sunumlar, dingin bir atmosfer ve her yudumda huzur hissiyle hazirlanan ozel bir secim."
    />

    <section class="filters-panel category-jump-panel">
      <div class="filters-heading">
        <p class="eyebrow">Hizli Gecis</p>
        <span>Bir kategoriyi sec ve ilgili urun akisini dogrudan ac.</span>
      </div>

      <div class="filters filters-soft">
        <RouterLink
          v-for="category in categories"
          :key="category.id"
          class="filter"
          :to="`/urunler/${category.id}`"
        >
          {{ category.name }}
        </RouterLink>
      </div>
    </section>

    <section class="categories">
      <CategoryCard
        v-for="(category, index) in categories"
        :key="category.id"
        :category="category"
        :reverse="index % 2 === 1"
      />
    </section>
  </main>
</template>

<script setup>
import { RouterLink } from "vue-router";

import CategoryCard from "../components/CategoryCard.vue";
import PageHeading from "../components/PageHeading.vue";
import { usePublicMenu } from "../composables/usePublicMenu";

const { categories } = usePublicMenu();
</script>
