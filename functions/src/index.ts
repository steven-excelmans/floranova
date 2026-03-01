import { onCall } from 'firebase-functions/v2/https';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

// Create user document on first sign-in
export const onUserCreated = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user.email) return;

  // Check admin whitelist
  const configDoc = await db.doc('config/admin').get();
  const adminEmails: string[] = configDoc.exists
    ? (configDoc.data()?.adminEmails ?? [])
    : [];

  const role = adminEmails.includes(user.email) ? 'admin' : 'user';

  await db.doc(`users/${user.uid}`).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? null,
    role,
    createdAt: new Date().toISOString(),
  });
});

// Admin-only: seed plants from client
export const seedPlants = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  const userDoc = await db.doc(`users/${request.auth.uid}`).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new Error('Admin access required');
  }

  const plants = request.data.plants as Record<string, unknown>[];
  const batch = db.batch();

  for (const plant of plants) {
    const id = plant.id as string;
    batch.set(db.doc(`plants/${id}`), {
      ...plant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();
  return { seeded: plants.length };
});
