<template>
  <component :is="activeLayout">
    <div class="route-stage">
      <Transition name="page-fade" mode="out-in">
        <RouterView :key="route.fullPath" />
      </Transition>
    </div>

    <Transition name="bird-overlay">
      <div v-if="showBirdTransition" class="bird-transition" aria-hidden="true">
        <div class="bird-zoom-stage">
          <div class="bird-logo-lockup">
            <div class="bird-sprite"></div>
          </div>
        </div>
      </div>
    </Transition>
  </component>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";

import AdminLayout from "./layouts/AdminLayout.vue";
import AuthLayout from "./layouts/AuthLayout.vue";
import PublicLayout from "./layouts/PublicLayout.vue";

const layouts = {
  public: PublicLayout,
  admin: AdminLayout,
  auth: AuthLayout,
};

const route = useRoute();
const router = useRouter();
const showBirdTransition = ref(false);
const activeLayout = computed(() => layouts[route.meta.layout] || PublicLayout);
let hideTimer = null;

const removeGuard = router.beforeEach((to, from) => {
  const isMenuTransition =
    from.path === "/" &&
    to.meta.layout === "public" &&
    (to.path.startsWith("/kategoriler") || to.path.startsWith("/urunler"));

  if (!isMenuTransition) return true;

  showBirdTransition.value = true;

  if (hideTimer) clearTimeout(hideTimer);

  hideTimer = setTimeout(() => {
    showBirdTransition.value = false;
    hideTimer = null;
  }, 1200);

  return true;
});

onBeforeUnmount(() => {
  removeGuard();
  if (hideTimer) clearTimeout(hideTimer);
});
</script>
