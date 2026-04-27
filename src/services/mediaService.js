const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

function ensureCloudinary() {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary ayarlari eksik. .env dosyasini kontrol et.");
  }
}

export async function uploadImageToCloudinary(file, folder = "mehlika/general") {
  ensureCloudinary();

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(
      errorPayload?.error?.message || "Cloudinary yukleme sirasinda bir hata olustu."
    );
  }

  const payload = await response.json();

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    deleteToken: payload.delete_token || "",
    width: payload.width,
    height: payload.height,
    format: payload.format,
  };
}

export async function deleteImageByToken(deleteToken) {
  ensureCloudinary();
  if (!deleteToken) return false;

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`;
  const formData = new FormData();
  formData.append("token", deleteToken);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  return response.ok;
}
