<template>
  <main class="auth-card">
    <p class="admin-kicker">Mehlika Admin</p>
    <h1>Panele giris yap</h1>
    <p class="auth-copy">
      Kategorileri, urunleri, fiyatlari ve gorselleri yonetmek icin Firebase hesabinla giris yap.
    </p>

    <div v-if="!isFirebaseConfigured" class="admin-alert admin-alert-warning">
      Firebase ayarlari eksik. Once `.env` dosyasini doldurman gerekiyor.
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <label class="admin-field">
        <span>E-posta</span>
        <input v-model.trim="form.email" type="email" placeholder="admin@mehlika.com" />
      </label>

      <label class="admin-field">
        <span>Sifre</span>
        <input v-model="form.password" type="password" placeholder="••••••••" />
      </label>

      <p v-if="errorMessage" class="admin-inline-error">{{ errorMessage }}</p>

      <button class="admin-primary-button" type="submit" :disabled="submitting || !isFirebaseConfigured">
        {{ submitting ? "Giris yapiliyor..." : "Giris Yap" }}
      </button>
    </form>
  </main>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { useAuth } from "../../composables/useAuth";
import { loginWithEmailPassword } from "../../services/authService";

const router = useRouter();
const { isFirebaseConfigured } = useAuth();

const form = reactive({
  email: "",
  password: "",
});

const submitting = ref(false);
const errorMessage = ref("");

async function handleSubmit() {
  errorMessage.value = "";
  submitting.value = true;

  try {
    await loginWithEmailPassword(form.email, form.password);
    router.push("/admin");
  } catch (error) {
    errorMessage.value = error.message || "Giris sirasinda bir hata olustu.";
  } finally {
    submitting.value = false;
  }
}
</script>
