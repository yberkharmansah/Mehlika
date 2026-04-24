<template>
  <section class="panel links-panel">
    <div class="section-title links-header">
      <div>
        <p class="eyebrow">Baglanti Noktalari</p>
        <h2>Mehlika'ya Ulas</h2>
      </div>
      <p>Menuden once mekani kesfet, konum al ve guncel paylasimlari tek dokunusta incele.</p>
    </div>

    <div class="venue-links-grid">
      <a
        v-for="link in links"
        :key="link.title"
        class="venue-link-card"
        :href="link.href"
        target="_blank"
        rel="noreferrer"
      >
        <span class="venue-link-icon material-symbols-outlined">{{ link.icon }}</span>
        <span class="venue-link-label">{{ link.label }}</span>
        <strong>{{ link.title }}</strong>
        <span class="venue-link-copy">{{ link.copy }}</span>
      </a>

      <div class="venue-link-card venue-link-card--hours">
        <span class="venue-link-icon material-symbols-outlined">schedule</span>
        <span class="venue-link-label">Servis Saatleri</span>
        <strong>{{ hours }}</strong>
        <span class="venue-link-copy">Gun boyu huzurlu bir mola icin mutfak ve kahve servisi devam eder.</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  hours: {
    type: String,
    required: true,
  },
  links: {
    type: Array,
    required: true,
  },
});
</script>
