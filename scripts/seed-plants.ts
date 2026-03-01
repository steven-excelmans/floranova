/**
 * Seed script: uploads all plants from src/data/plants.ts to Firestore.
 *
 * Usage:
 *   npx tsx scripts/seed-plants.ts
 *
 * Requires:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account key
 *   - OR run after `firebase login` with the Firebase Admin SDK
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize with default credentials or service account
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error('Set FIREBASE_PROJECT_ID env variable');
  process.exit(1);
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (serviceAccountPath) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(serviceAccountPath);
  initializeApp({ credential: cert(serviceAccount), projectId });
} else {
  initializeApp({ projectId });
}

const db = getFirestore();

async function seed() {
  // Dynamic import of the plant data
  const { default: plants } = await import('../src/data/plants');

  console.log(`Seeding ${plants.length} plants to Firestore...`);

  const batch = db.batch();
  const now = new Date().toISOString();

  for (const plant of plants) {
    const docRef = db.doc(`plants/${plant.id}`);
    batch.set(docRef, {
      ...plant,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`Successfully seeded ${plants.length} plants!`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
