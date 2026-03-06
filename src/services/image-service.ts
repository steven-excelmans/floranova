import type { PlantImage } from 'src/types/plant';

const CLOUD_NAME = 'dpultori7';
const UPLOAD_PRESET = 'floranova-preset';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const MAX_WIDTH = 800;
const QUALITY = 0.8;

export async function compressImage(source: Blob | File): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const scale = bitmap.width > MAX_WIDTH ? MAX_WIDTH / bitmap.width : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.convertToBlob({ type: 'image/webp', quality: QUALITY });
}

export async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  return response.blob();
}

export async function uploadPlantImage(
  plantId: string,
  blob: Blob,
  filename: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `plants/${plantId}`);

  const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Upload a remote URL directly to Cloudinary (avoids CORS issues).
 * Cloudinary fetches the image server-side.
 */
export async function uploadRemoteUrl(
  plantId: string,
  remoteUrl: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', remoteUrl);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `plants/${plantId}`);

  const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const data = await response.json();
  return data.secure_url;
}

export async function processAndUploadImage(
  plantId: string,
  source: File | Blob | string,
  index: number,
): Promise<PlantImage> {
  if (typeof source === 'string') {
    // Let Cloudinary fetch the remote URL server-side (avoids CORS)
    const url = await uploadRemoteUrl(plantId, source);
    return { url };
  }

  const compressed = await compressImage(source);
  const filename = `img-${index}-${Date.now()}.webp`;
  const url = await uploadPlantImage(plantId, compressed, filename);

  return { url };
}
