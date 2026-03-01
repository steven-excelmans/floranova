import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

interface StockDoc {
  plantId: string;
  inStock: boolean;
  updatedAt: string;
}

function stockCollection(userId: string) {
  return collection(db, 'users', userId, 'stock');
}

function stockDoc(userId: string, plantId: string) {
  return doc(db, 'users', userId, 'stock', plantId);
}

export function subscribeStock(
  userId: string,
  callback: (stock: Record<string, boolean>) => void,
): Unsubscribe {
  const q = query(stockCollection(userId));
  return onSnapshot(q, (snapshot) => {
    const stock: Record<string, boolean> = {};
    for (const d of snapshot.docs) {
      const data = d.data() as StockDoc;
      stock[data.plantId] = data.inStock;
    }
    callback(stock);
  });
}

export async function setStock(
  userId: string,
  plantId: string,
  inStock: boolean,
): Promise<void> {
  await setDoc(stockDoc(userId, plantId), {
    plantId,
    inStock,
    updatedAt: new Date().toISOString(),
  });
}
