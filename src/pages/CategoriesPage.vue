<template>
  <main class="page">
    <PageHeading
      eyebrow="Kategoriler"
      title="Mehlika Seckisi"
      subtitle="Zarif sunumlar, dingin bir atmosfer ve her yudumda huzur hissiyle hazirlanan ozel bir secim."
    />

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
import CategoryCard from "../components/CategoryCard.vue";
import PageHeading from "../components/PageHeading.vue";
import { categories } from "../data/menu";
</script>
