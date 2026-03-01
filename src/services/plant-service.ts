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
import type { Plant, PlantStatus } from 'src/types/plant';

const COLLECTION = 'plants';

function plantsCollection() {
  return collection(db, COLLECTION);
}

function plantDoc(id: string) {
  return doc(db, COLLECTION, id);
}

export function subscribePlants(callback: (plants: Plant[]) => void): Unsubscribe {
  const q = query(plantsCollection());
  return onSnapshot(q, (snapshot) => {
    const plants = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Plant);
    callback(plants);
  });
}

export async function savePlant(plant: Plant): Promise<void> {
  await setDoc(plantDoc(plant.id), {
    ...plant,
    updatedAt: new Date().toISOString(),
  });
}

export async function createPlant(plant: Plant): Promise<void> {
  const now = new Date().toISOString();
  await setDoc(plantDoc(plant.id), {
    ...plant,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updatePlantStatus(id: string, status: PlantStatus): Promise<void> {
  await setDoc(plantDoc(id), { status, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deletePlant(id: string): Promise<void> {
  await deleteDoc(plantDoc(id));
}
