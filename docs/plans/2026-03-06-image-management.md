# Image Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add image upload/management to plant editor with Firebase Storage, client-side compression, cover selection, and focal point positioning.

**Architecture:** Images are uploaded to Firebase Storage as compressed WebP files (~80 KB). Firestore stores `PlantImage[]` metadata (URL, focal point, cover flag). The PlantEditDialog gets a 6th "Images" tab with gallery grid, cover preview, focal point editor, and upload zone. The import pipeline auto-downloads external URLs and re-uploads to Storage.

**Tech Stack:** Firebase Storage (already in `firebase` v12.10.0), Canvas API for client-side WebP compression, existing Quasar/Vue stack.

---

## Task 1: Update Plant type with PlantImage model

**Files:**
- Modify: `src/types/plant.ts`

**Step 1: Add PlantImage interface and update Plant**

Add `PlantImage` interface after existing types. Change `images: string[]` to `images: (string | PlantImage)[]` for backward compatibility — old string URLs still work, new images use the object format.

```ts
// Add after PlantColor interface
export interface PlantImage {
  url: string;
  focalPoint?: { x: number; y: number };    // 0-100 — used for detail hero
  thumbFocalPoint?: { x: number; y: number }; // 0-100 — used for card thumbnail crop
  isCover?: boolean;
}
```

Update the Plant interface:
```ts
  images: (string | PlantImage)[];
```

Add a helper function to normalize images:
```ts
export function normalizeImage(img: string | PlantImage): PlantImage {
  if (typeof img === 'string') return { url: img };
  return img;
}

export function getCoverImage(images: (string | PlantImage)[]): PlantImage | null {
  if (images.length === 0) return null;
  const normalized = images.map(normalizeImage);
  return normalized.find(i => i.isCover) ?? normalized[0] ?? null;
}
```

**Step 2: Run type check**

Run: `npx vue-tsc --noEmit`
Expected: Errors in files that use `plant.images` as `string[]` — these will be fixed in subsequent tasks.

**Step 3: Commit**

```
feat: add PlantImage type with focal point and cover support
```

---

## Task 2: Create image compression service

**Files:**
- Create: `src/services/image-service.ts`

**Step 1: Create the service**

This service handles: client-side compression to WebP, Firebase Storage upload/delete, and URL-to-blob fetching.

```ts
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { PlantImage } from 'src/types/plant';

const MAX_WIDTH = 800;
const QUALITY = 0.8;

/**
 * Compress an image file/blob to WebP using Canvas API.
 * Resizes to MAX_WIDTH maintaining aspect ratio.
 */
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

/**
 * Fetch an image from a URL and return as Blob.
 * Uses a CORS proxy approach for external URLs if needed.
 */
export async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  return response.blob();
}

/**
 * Upload a compressed image to Firebase Storage.
 * Path: plants/{plantId}/{filename}
 * Returns the download URL.
 */
export async function uploadPlantImage(
  plantId: string,
  blob: Blob,
  filename: string,
): Promise<string> {
  const storage = getStorage();
  const path = `plants/${plantId}/${filename}`;
  const imageRef = storageRef(storage, path);
  await uploadBytes(imageRef, blob, { contentType: 'image/webp' });
  return getDownloadURL(imageRef);
}

/**
 * Delete an image from Firebase Storage by its download URL.
 */
export async function deletePlantImage(downloadUrl: string): Promise<void> {
  try {
    const storage = getStorage();
    // Extract path from Firebase Storage URL
    const url = new URL(downloadUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
    if (!pathMatch) return;
    const path = decodeURIComponent(pathMatch[1]);
    const imageRef = storageRef(storage, path);
    await deleteObject(imageRef);
  } catch {
    // Ignore delete failures (image may not exist in storage)
  }
}

/**
 * Full pipeline: take a File or URL, compress, upload, return PlantImage.
 */
export async function processAndUploadImage(
  plantId: string,
  source: File | Blob | string,
  index: number,
): Promise<PlantImage> {
  let blob: Blob;
  if (typeof source === 'string') {
    blob = await fetchImageBlob(source);
  } else {
    blob = source;
  }

  const compressed = await compressImage(blob);
  const filename = `img-${index}-${Date.now()}.webp`;
  const url = await uploadPlantImage(plantId, compressed, filename);

  return { url };
}
```

**Step 2: Export storage from firebase boot**

Modify `src/boot/firebase.ts` — add storage export:

```ts
import { getStorage } from 'firebase/storage';
// ... after existing exports
const storage = getStorage(app);
export { db, auth, storage };
```

**Step 3: Run type check**

Run: `npx vue-tsc --noEmit`

**Step 4: Commit**

```
feat: add image compression and Firebase Storage service
```

---

## Task 3: Add Images tab to PlantEditDialog

**Files:**
- Modify: `src/components/admin/PlantEditDialog.vue`

This is the main UI task. Add the 6th "Images" tab matching the mock design pixel-perfect.

**Step 1: Add tab definition**

In the `tabs` computed, add after 'notes':
```ts
{ id: 'images' as TabId, icon: 'photo_library', label: t('admin.images'), badge: false },
```

Update `TabId` type:
```ts
type TabId = 'identity' | 'calendar' | 'growing' | 'care' | 'notes' | 'images';
```

**Step 2: Add images state variables**

After existing refs:
```ts
import { normalizeImage, getCoverImage, type PlantImage } from 'src/types/plant';
import { compressImage, uploadPlantImage, deletePlantImage, fetchImageBlob } from 'src/services/image-service';

const showUploadZone = ref(false);
const urlInput = ref('');
const uploading = ref(false);
const editingFocalIdx = ref<number | null>(null);
```

Add computed helpers:
```ts
const normalizedImages = computed(() =>
  form.value.images.map(normalizeImage)
);

const coverIndex = computed(() => {
  const idx = normalizedImages.value.findIndex(i => i.isCover);
  return idx >= 0 ? idx : 0;
});

const coverImage = computed(() =>
  normalizedImages.value[coverIndex.value] ?? null
);
```

**Step 3: Add image management functions**

```ts
function setCover(idx: number) {
  form.value.images = form.value.images.map((img, i) => {
    const n = normalizeImage(img);
    return { ...n, isCover: i === idx };
  });
}

function removeImage(idx: number) {
  form.value.images.splice(idx, 1);
  // If removed was cover, first image becomes cover
  const imgs = form.value.images.map(normalizeImage);
  if (imgs.length > 0 && !imgs.some(i => i.isCover)) {
    form.value.images[0] = { ...normalizeImage(form.value.images[0]!), isCover: true };
  }
}

function setFocalPoint(idx: number, x: number, y: number) {
  const img = normalizeImage(form.value.images[idx]!);
  form.value.images[idx] = { ...img, focalPoint: { x, y } };
}

async function addImageFromUrl() {
  const url = urlInput.value.trim();
  if (!url) return;
  uploading.value = true;
  try {
    // For now just add URL directly — upload to Storage happens on save
    const newImg: PlantImage = { url };
    if (form.value.images.length === 0) newImg.isCover = true;
    form.value.images.push(newImg);
    urlInput.value = '';
    showUploadZone.value = false;
    $q.notify({ type: 'positive', message: 'Image added', position: 'top' });
  } finally {
    uploading.value = false;
  }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;
  uploading.value = true;
  try {
    for (const file of files) {
      const compressed = await compressImage(file);
      const plantId = form.value.id || 'temp';
      const idx = form.value.images.length;
      const url = await uploadPlantImage(plantId, compressed, `img-${idx}-${Date.now()}.webp`);
      const newImg: PlantImage = { url };
      if (form.value.images.length === 0) newImg.isCover = true;
      form.value.images.push(newImg);
    }
    $q.notify({ type: 'positive', message: 'Image uploaded', position: 'top' });
  } catch (err) {
    $q.notify({ type: 'negative', message: `Upload failed: ${String(err)}`, position: 'top' });
  } finally {
    uploading.value = false;
    input.value = '';
  }
}

function handleCoverClick(event: MouseEvent, container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const x = Math.round((event.clientX - rect.left) / rect.width * 100);
  const y = Math.round((event.clientY - rect.top) / rect.height * 100);
  setFocalPoint(coverIndex.value, x, y);
}

function handleFocalClick(event: MouseEvent, container: HTMLElement) {
  if (editingFocalIdx.value === null) return;
  const rect = container.getBoundingClientRect();
  const x = Math.round((event.clientX - rect.left) / rect.width * 100);
  const y = Math.round((event.clientY - rect.top) / rect.height * 100);
  setFocalPoint(editingFocalIdx.value, x, y);
}
```

**Step 4: Add template for Images panel**

After the Notes panel closing `</div>`, add:

```html
<!-- Images -->
<div class="panel" :class="{ 'panel--active': activeTab === 'images' }">
  <!-- Cover preview -->
  <div v-if="coverImage" class="cover-section">
    <div class="field__label" style="margin-bottom: 6px;">
      {{ t('admin.coverPhoto') }}
      <span class="field__opt">{{ t('admin.clickFocalPoint') }}</span>
    </div>
    <div class="cover-preview" @click="handleCoverClick($event, $el)">
      <img
        :src="coverImage.url"
        alt="Cover"
        :style="coverImage.focalPoint
          ? { objectPosition: `${coverImage.focalPoint.x}% ${coverImage.focalPoint.y}%` }
          : {}"
      />
      <div
        class="focal-point"
        :style="{
          left: (coverImage.focalPoint?.x ?? 50) + '%',
          top: (coverImage.focalPoint?.y ?? 50) + '%',
        }"
      />
      <div class="cover-badge">
        <span class="material-icons-outlined">star</span>
        Cover
      </div>
      <div class="focal-hint">{{ t('admin.clickFocalPoint') }}</div>
    </div>
  </div>

  <div v-if="normalizedImages.length" class="section-divider" />

  <!-- Image count -->
  <div class="image-count">
    <div class="image-count__text">
      <strong>{{ normalizedImages.length }}</strong> {{ normalizedImages.length === 1 ? 'image' : 'images' }}
    </div>
  </div>

  <!-- Gallery grid -->
  <div class="gallery-grid">
    <div
      v-for="(img, idx) in normalizedImages"
      :key="idx"
      class="gallery-item"
      :class="{ 'gallery-item--cover': idx === coverIndex }"
      @click="setCover(idx)"
    >
      <img :src="img.url" alt="" loading="lazy" />
      <div class="gallery-item__actions">
        <button
          class="gallery-item__btn gallery-item__btn--star"
          :class="{ active: idx === coverIndex }"
          :title="idx === coverIndex ? 'Cover photo' : 'Set as cover'"
          @click.stop="setCover(idx)"
        >
          <span class="material-icons-outlined">{{ idx === coverIndex ? 'star' : 'star_border' }}</span>
        </button>
        <button
          class="gallery-item__btn"
          title="Adjust position"
          @click.stop="editingFocalIdx = editingFocalIdx === idx ? null : idx"
        >
          <span class="material-icons-outlined">center_focus_strong</span>
        </button>
        <button
          class="gallery-item__btn"
          title="Delete"
          @click.stop="removeImage(idx)"
        >
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
      <div v-if="idx === coverIndex" class="gallery-item__cover-tag">Cover</div>
    </div>

    <!-- Add tile -->
    <button class="gallery-add" @click="showUploadZone = !showUploadZone">
      <span class="material-icons-outlined">add_photo_alternate</span>
      <span>Add</span>
    </button>
  </div>

  <!-- Focal point editor (inline) -->
  <div v-if="editingFocalIdx !== null" class="focal-editor focal-editor--open">
    <div class="focal-editor__header">
      <div class="focal-editor__title">{{ t('admin.adjustPosition') }}</div>
      <button class="focal-editor__close" @click="editingFocalIdx = null">
        <span class="material-icons-outlined">close</span>
      </button>
    </div>
    <div class="focal-editor__image" @click="handleFocalClick($event, $el as HTMLElement)">
      <img :src="normalizedImages[editingFocalIdx]?.url" alt="" />
      <div
        class="focal-point"
        :style="{
          left: (normalizedImages[editingFocalIdx]?.focalPoint?.x ?? 50) + '%',
          top: (normalizedImages[editingFocalIdx]?.focalPoint?.y ?? 50) + '%',
        }"
      />
      <div class="focal-hint">{{ t('admin.clickFocalPoint') }}</div>
    </div>
  </div>

  <!-- Upload zone -->
  <div v-if="showUploadZone" class="upload-zone" style="margin-top: 14px;">
    <div class="upload-zone__icon">
      <span class="material-icons-outlined">cloud_upload</span>
    </div>
    <div class="upload-zone__text">Drop image here or tap to upload</div>
    <div class="upload-zone__hint">Auto-compressed to WebP ~80 KB</div>
    <input
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileUpload"
    />
    <div class="upload-zone__or">or paste a URL</div>
    <div class="upload-zone__url-row">
      <input
        v-model="urlInput"
        class="upload-zone__url-input"
        type="text"
        placeholder="https://example.com/photo.jpg"
        @keydown.enter="addImageFromUrl"
      />
      <button class="upload-zone__url-btn" :disabled="uploading" @click="addImageFromUrl">
        Add
      </button>
    </div>
  </div>

  <!-- Empty state -->
  <div v-if="normalizedImages.length === 0 && !showUploadZone" class="cover-preview" style="margin-top: 8px;">
    <div class="cover-preview__empty" @click="showUploadZone = true">
      <span class="material-icons-outlined">add_photo_alternate</span>
      <span>Add your first image</span>
    </div>
  </div>
</div>
```

**Step 5: Add the scoped CSS**

Add the styles from the mock to the `<style>` section. These styles are pixel-perfect copies from the mock HTML — cover-section, cover-preview, focal-point, cover-badge, focal-hint, gallery-grid, gallery-item, gallery-add, upload-zone, focal-editor, image-count classes. Copy them directly from `temp/image-management-mock.html` CSS (the IMAGE TAB section).

**Step 6: Run type check and lint**

Run: `npx vue-tsc --noEmit && npx eslint src/components/admin/PlantEditDialog.vue`

**Step 7: Commit**

```
feat: add Images tab to PlantEditDialog with gallery, cover, and focal point
```

---

## Task 4: Add missing i18n keys

**Files:**
- Modify: `src/i18n/en-US/index.ts`
- Modify: `src/i18n/nl/index.ts`

**Step 1: Add keys to admin section in both locales**

English:
```ts
coverPhoto: 'Cover Photo',
clickFocalPoint: 'click to set focal point',
adjustPosition: 'Adjust position',
imageAdded: 'Image added',
imageRemoved: 'Image removed',
imageUploaded: 'Image uploaded',
uploadFailed: 'Upload failed',
addFirstImage: 'Add your first image',
```

Dutch:
```ts
coverPhoto: 'Omslagfoto',
clickFocalPoint: 'klik om focuspunt in te stellen',
adjustPosition: 'Positie aanpassen',
imageAdded: 'Afbeelding toegevoegd',
imageRemoved: 'Afbeelding verwijderd',
imageUploaded: 'Afbeelding geüpload',
uploadFailed: 'Upload mislukt',
addFirstImage: 'Voeg je eerste afbeelding toe',
```

**Step 2: Commit**

```
feat: add image management i18n keys
```

---

## Task 5: Update consumers — PlantDetailPage, PlantCard

**Files:**
- Modify: `src/pages/PlantDetailPage.vue`
- Modify: `src/components/catalog/PlantCard.vue`

**Step 1: Update PlantDetailPage hero to use PlantImage**

The hero currently uses `plant.images[imageIndex]` as a string. Update to support both formats:

```ts
import { normalizeImage, getCoverImage } from 'src/types/plant';

const currentImage = computed(() => {
  if (!plant.value || plant.value.images.length === 0) return null;
  const img = normalizeImage(plant.value.images[imageIndex.value] ?? plant.value.images[0]!);
  return img;
});
```

Update the template `<img>`:
```html
<img
  v-if="currentImage"
  :src="currentImage.url"
  :alt="displayName"
  class="hero__img"
  :style="currentImage.focalPoint
    ? { objectPosition: `${currentImage.focalPoint.x}% ${currentImage.focalPoint.y}%` }
    : {}"
/>
```

Also update `imageIndex` initialization to start at cover image:
```ts
const imageIndex = ref(0);
// Set initial index to cover image
watch(() => plant.value, (p) => {
  if (!p) return;
  const coverIdx = p.images.findIndex(img => {
    const n = normalizeImage(img);
    return n.isCover;
  });
  if (coverIdx >= 0) imageIndex.value = coverIdx;
}, { immediate: true });
```

**Step 2: Update PlantCard to use cover image**

The card currently uses `plant.images[0]`. Update to prefer the cover:

```ts
import { getCoverImage } from 'src/types/plant';

const coverUrl = computed(() => {
  const cover = getCoverImage(props.plant.images);
  return cover?.url ?? null;
});
```

Update template:
```html
<img v-if="coverUrl" :src="coverUrl" ... />
<div v-if="imgError || !coverUrl" class="plant-img-placeholder">
```

**Step 3: Run type check and lint**

Run: `npx vue-tsc --noEmit && npx eslint src/pages/PlantDetailPage.vue src/components/catalog/PlantCard.vue`

**Step 4: Commit**

```
feat: update PlantDetailPage and PlantCard to use PlantImage with focal point
```

---

## Task 6: Update validator and prompt generator

**Files:**
- Modify: `src/composables/usePlantValidator.ts`
- Modify: `src/composables/usePromptGenerator.ts`

**Step 1: Update validator**

The validator currently checks `if (!Array.isArray(data.images))`. Update to also normalize string images:

After existing validation, add normalization:
```ts
// Normalize images to PlantImage format
if (Array.isArray(data.images)) {
  data.images = (data.images as (string | Record<string, unknown>)[]).map((img) => {
    if (typeof img === 'string') return { url: img };
    return img;
  });
}
```

**Step 2: Update prompt generator schema**

Update the images line in `SCHEMA_DESCRIPTION`:
```ts
  images: [{ url: string, isCover?: boolean }] | string[],  // Image URLs (string[] also accepted)
```

**Step 3: Commit**

```
feat: update validator and prompt generator for PlantImage format
```

---

## Task 7: Add image auto-download to import pipeline (deferred)

**Note:** This task downloads external URLs during import and re-uploads to Firebase Storage. This involves CORS considerations (Wikipedia URLs may not allow direct fetch from browser). **Defer this to a follow-up** — for now, imports store the original URL directly. The upload-to-Storage pipeline works for manual uploads via the editor.

When ready to implement:
- In `ImportDataPage.vue`'s `doImport()`, after saving the plant, iterate `plant.images` and for each external URL, try `processAndUploadImage()` and update the plant doc with the new Storage URLs.
- Handle CORS failures gracefully — keep original URL if download fails.
- Consider using a Firebase Cloud Function as a proxy for downloading external images server-side.

**Step 1: Commit**

```
docs: note deferred image auto-download in import pipeline
```

---

## Task 8: Update AddPlantsSheet and AddNamesPage

**Files:**
- Modify: `src/components/admin/AddPlantsSheet.vue`
- Modify: `src/pages/admin/AddNamesPage.vue`

These files create empty plants with `images: []`. This still works since `(string | PlantImage)[]` accepts an empty array. No changes needed unless type checking complains.

**Step 1: Verify type check passes**

Run: `npx vue-tsc --noEmit`

---

## Task 9: Final verification

**Step 1: Full type check**
Run: `npx vue-tsc --noEmit`

**Step 2: Full lint**
Run: `npx eslint src/**/*.{ts,vue}`

**Step 3: Manual testing checklist**
- [ ] Open plant editor → Images tab visible
- [ ] Empty state shows "Add your first image"
- [ ] Click add → upload zone appears with spacing
- [ ] Paste URL → image appears in gallery
- [ ] First image auto-set as cover
- [ ] Click star on another image → cover changes
- [ ] Cover preview updates with new cover
- [ ] Click on cover preview → focal point moves
- [ ] Click focus icon on gallery item → focal editor opens inline
- [ ] Click X on gallery item → image removed
- [ ] Save plant → images persisted in Firestore
- [ ] Catalog card shows cover image
- [ ] Detail page hero uses focal point for object-position

**Step 4: Commit all**
```
feat: complete image management system with Firebase Storage
```
