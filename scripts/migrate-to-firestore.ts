/**
 * One-time migration: seed Firestore with static plant data.
 * Uses Firebase Admin SDK (inherits auth from `firebase login`).
 *
 * Usage: npx tsx scripts/migrate-to-firestore.ts
 */
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Uses Application Default Credentials (from `firebase login` or GOOGLE_APPLICATION_CREDENTIALS)
initializeApp({
  credential: applicationDefault(),
  projectId: 'floranova-2cb63',
});

const db = getFirestore();

async function migrate() {
  const { default: plants } = await import('../src/data/plants.ts');
  console.log(`Seeding ${plants.length} plants to Firestore...`);

  const now = new Date().toISOString();
  const batch = db.batch();

  for (const plant of plants) {
    const ref = db.collection('plants').doc(plant.id);
    batch.set(ref, {
      ...plant,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`Done! Seeded ${plants.length} plants.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
