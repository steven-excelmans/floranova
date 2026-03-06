/**
 * Enrich a single plant in Firestore with images uploaded to Cloudinary.
 *
 * Usage: npx tsx scripts/enrich-plant.ts <plant-id> <image-url-1> [image-url-2]
 *
 * This script:
 * 1. Uploads provided image URLs to Cloudinary (server-side fetch)
 * 2. Updates the plant's images array in Firestore
 * 3. Optionally updates harvestPeriod if provided via --harvest flag
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: 'floranova-2cb63',
});

const db = getFirestore();

const CLOUD_NAME = 'dpultori7';
const UPLOAD_PRESET = 'floranova-preset';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

async function uploadToCloudinary(plantId: string, imageUrl: string): Promise<string> {
  const formData = new URLSearchParams();
  formData.append('file', imageUrl);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `plants/${plantId}`);

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed for ${plantId}: ${error}`);
  }

  const data = await response.json();
  return data.secure_url;
}

async function enrichPlant(plantId: string, imageUrls: string[], harvestPeriod?: number[]) {
  console.log(`\nProcessing: ${plantId}`);
  console.log(`  Uploading ${imageUrls.length} image(s)...`);

  const images: { url: string; isCover?: boolean; isCardPreview?: boolean }[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const cloudinaryUrl = await uploadToCloudinary(plantId, imageUrls[i]);
      console.log(`  ✓ Image ${i + 1}: ${cloudinaryUrl}`);
      images.push({
        url: cloudinaryUrl,
        ...(i === 0 ? { isCover: true, isCardPreview: true } : {}),
      });
    } catch (err) {
      console.error(`  ✗ Image ${i + 1} failed:`, err);
    }
  }

  if (images.length === 0) {
    console.log(`  ⚠ No images uploaded for ${plantId}, skipping Firestore update`);
    return;
  }

  const update: Record<string, unknown> = {
    images,
    updatedAt: new Date().toISOString(),
  };

  if (harvestPeriod && harvestPeriod.length > 0) {
    update['calendar.harvestPeriod'] = harvestPeriod;
  }

  await db.collection('plants').doc(plantId).update(update);
  console.log(`  ✓ Firestore updated with ${images.length} image(s)`);
}

// Parse CLI args
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npx tsx scripts/enrich-plant.ts <plant-id> <image-url-1> [image-url-2] [--harvest 6,7,8,9]');
  process.exit(1);
}

const plantId = args[0];
let harvestPeriod: number[] | undefined;
const imageUrls: string[] = [];

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--harvest' && args[i + 1]) {
    harvestPeriod = args[i + 1].split(',').map(Number);
    i++; // skip next arg
  } else {
    imageUrls.push(args[i]);
  }
}

enrichPlant(plantId, imageUrls, harvestPeriod)
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
