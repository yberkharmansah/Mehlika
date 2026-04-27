<template>
  <Teleport to="body">
    <div v-if="open" class="cropper-overlay">
      <div class="cropper-dialog">
        <div class="cropper-header">
          <div>
            <p class="admin-kicker">Gorsel Duzenleme</p>
            <h3>{{ title }}</h3>
          </div>
          <button class="admin-icon-button" type="button" @click="$emit('close')">Kapat</button>
        </div>

        <div class="cropper-stage">
          <img ref="imageRef" :src="src" alt="Kirpma onizleme" class="cropper-image" />
        </div>

        <div class="cropper-toolbar">
          <label class="admin-field">
            <span>Yakinlastirma</span>
            <input v-model="zoomLevel" type="range" min="1" max="3" step="0.01" @input="applyZoom" />
          </label>

          <div class="cropper-actions">
            <button class="admin-ghost-button" type="button" @click="resetCropper">Sifirla</button>
            <button class="admin-primary-button" type="button" :disabled="submitting" @click="confirmCrop">
              {{ submitting ? "Hazirlaniyor..." : "Kirp ve Yukle" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import Cropper from "cropperjs";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  src: {
    type: String,
    default: "",
  },
  fileName: {
    type: String,
    default: "image.jpg",
  },
  title: {
    type: String,
    default: "Gorseli duzenle",
  },
  aspectRatio: {
    type: Number,
    default: 1.6,
  },
});

const emit = defineEmits(["close", "confirm"]);

const imageRef = ref(null);
const cropper = ref(null);
const zoomLevel = ref(1);
const submitting = ref(false);

function destroyCropper() {
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
}

async function initCropper() {
  destroyCropper();
  if (!props.open || !props.src) return;

  await nextTick();
  if (!imageRef.value) return;

  cropper.value = new Cropper(imageRef.value, {
    aspectRatio: props.aspectRatio,
    viewMode: 1,
    dragMode: "move",
    autoCropArea: 1,
    background: false,
    responsive: true,
    guides: false,
  });

  zoomLevel.value = 1;
}

function applyZoom() {
  if (!cropper.value) return;
  cropper.value.zoomTo(Number(zoomLevel.value));
}

function resetCropper() {
  if (!cropper.value) return;
  cropper.value.reset();
  zoomLevel.value = 1;
}

function confirmCrop() {
  if (!cropper.value) return;
  submitting.value = true;

  const canvas = cropper.value.getCroppedCanvas({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
  });

  canvas.toBlob(
    async (blob) => {
      if (!blob) {
        submitting.value = false;
        return;
      }

      const extension = blob.type === "image/png" ? "png" : "jpg";
      const file = new File([blob], `${props.fileName.split(".")[0]}.${extension}`, {
        type: blob.type || "image/jpeg",
      });

      emit("confirm", file);
      submitting.value = false;
    },
    "image/jpeg",
    0.92
  );
}

watch(
  () => [props.open, props.src, props.aspectRatio],
  () => {
    initCropper();
  }
);

onBeforeUnmount(destroyCropper);
</script>
