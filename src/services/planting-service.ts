import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import type { Planting } from 'src/types/planting';

function plantingsCollection(userId: string) {
  return collection(db, 'users', userId, 'plantings');
}

function plantingDoc(userId: string, plantingId: string) {
  return doc(db, 'users', userId, 'plantings', plantingId);
}

export function subscribePlantings(
  userId: string,
  callback: (plantings: Planting[]) => void,
): Unsubscribe {
  const q = query(plantingsCollection(userId));
  return onSnapshot(q, (snapshot) => {
    const plantings = snapshot.docs.map((d) => d.data() as Planting);
    callback(plantings);
  });
}

export async function savePlanting(userId: string, planting: Planting): Promise<void> {
  await setDoc(plantingDoc(userId, planting.id), planting);
}

export async function removePlanting(userId: string, plantingId: string): Promise<void> {
  await deleteDoc(plantingDoc(userId, plantingId));
}

export async function updatePlantingMilestones(
  userId: string,
  plantingId: string,
  completedMilestones: string[],
): Promise<void> {
  await setDoc(
    plantingDoc(userId, plantingId),
    { completedMilestones },
    { merge: true },
  );
}
