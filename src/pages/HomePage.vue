<template>
  <main class="page">
    <HeroSection :venue="venue" />
    <VenueLinksPanel :hours="venue.hours" :links="venue.links" />
  </main>
</template>

<script setup>
import HeroSection from "../components/HeroSection.vue";
import VenueLinksPanel from "../components/VenueLinksPanel.vue";
import { usePublicMenu } from "../composables/usePublicMenu";

const { venue } = usePublicMenu();
</script>
