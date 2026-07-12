<template>
  <Teleport to="body">
    <div v-if="open" class="cropper-overlay">
      <div class="cropper-dialog">
        <div class="cropper-header">
          <div>
            <p class="admin-kicker">Görsel Düzenleme</p>
            <h3>{{ title }}</h3>
          </div>
          <button class="admin-icon-button" type="button" :disabled="busy" @click="$emit('close')">Kapat</button>
        </div>

        <div class="cropper-stage">
          <img ref="imageRef" :src="src" alt="Kırpma önizleme" class="cropper-image" />
        </div>

        <div class="cropper-toolbar cropper-toolbar-extended">
          <div class="cropper-zoom-panel">
            <div class="cropper-zoom-head">
              <span>Yakınlaştırma</span>
              <strong>%{{ zoomPercent }}</strong>
            </div>

            <input
              v-model="zoomPercent"
              class="cropper-zoom-range"
              type="range"
              :min="zoomPercentMin"
              :max="zoomPercentMax"
              step="1"
              @input="applyZoom"
            />

            <div class="cropper-zoom-actions">
              <button class="admin-ghost-button" type="button" @click="stepZoom(-12)">Uzaklaş</button>
              <button class="admin-ghost-button" type="button" @click="fitImage">Sığdır</button>
              <button class="admin-ghost-button" type="button" @click="stepZoom(12)">Yakınlaş</button>
            </div>
          </div>

          <div class="cropper-actions">
            <button class="admin-ghost-button" type="button" :disabled="busy" @click="resetCropper">Sıfırla</button>
            <button class="admin-primary-button" type="button" :disabled="submitting || busy" @click="confirmCrop">
              {{ submitting || busy ? "Yükleniyor..." : "Kırp ve Yükle" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import Cropper from "cropperjs";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

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
    default: "Görseli düzenle",
  },
  aspectRatio: {
    type: Number,
    default: 1.6,
  },
  busy: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "confirm"]);

const imageRef = ref(null);
const cropper = ref(null);
const baseZoom = ref(1);
const zoomPercent = ref(100);
const zoomPercentMin = ref(20);
const zoomPercentMax = ref(260);
const submitting = ref(false);

const currentZoomRatio = computed(
  () => Number(baseZoom.value || 1) * (Number(zoomPercent.value || 100) / 100)
);

function clampPercent(value) {
  return Math.min(
    Number(zoomPercentMax.value),
    Math.max(Number(zoomPercentMin.value), Number(value))
  );
}

function syncZoomFromCropper() {
  if (!cropper.value) return;
  const imageData = cropper.value.getImageData();
  if (!imageData?.ratio) return;
  zoomPercent.value = clampPercent((Number(imageData.ratio) / Number(baseZoom.value || 1)) * 100);
}

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
    viewMode: 0,
    dragMode: "move",
    autoCropArea: 0.62,
    background: false,
    responsive: true,
    guides: false,
    center: true,
    highlight: false,
    modal: true,
    zoomOnWheel: true,
    ready() {
      const imageData = cropper.value?.getImageData();
      const containerData = cropper.value?.getContainerData();
      const initialRatio = imageData?.ratio || 1;

      baseZoom.value = initialRatio;
      zoomPercentMin.value = 5;
      zoomPercentMax.value = 320;
      zoomPercent.value = 100;
      cropper.value?.zoomTo(initialRatio);

      if (containerData?.width && containerData?.height) {
        cropper.value?.setCropBoxData({
          width: containerData.width * 0.78,
          height: (containerData.width * 0.78) / props.aspectRatio,
        });
      }
    },
    zoom() {
      syncZoomFromCropper();
    },
  });
}

function applyZoom() {
  if (!cropper.value) return;
  cropper.value.zoomTo(currentZoomRatio.value);
}

function fitImage() {
  if (!cropper.value) return;
  zoomPercent.value = 100;
  cropper.value.zoomTo(baseZoom.value);
}

function stepZoom(amount) {
  if (!cropper.value) return;
  zoomPercent.value = clampPercent(Number(zoomPercent.value) + amount);
  cropper.value.zoomTo(currentZoomRatio.value);
}

function resetCropper() {
  if (!cropper.value) return;
  cropper.value.reset();
  fitImage();
}

function confirmCrop() {
  if (!cropper.value || submitting.value || props.busy) return;
  submitting.value = true;

  const canvas = cropper.value.getCroppedCanvas({
    maxWidth: 1600,
    maxHeight: Math.round(1600 / Number(props.aspectRatio || 1.6)),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
    fillColor: "#fbf6eb",
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
    },
    "image/jpeg",
    0.82
  );
}

watch(
  () => props.busy,
  (value) => {
    if (!value) {
      submitting.value = false;
    }
  }
);

watch(
  () => [props.open, props.src, props.aspectRatio],
  () => {
    initCropper();
  }
);

onBeforeUnmount(destroyCropper);
</script>
