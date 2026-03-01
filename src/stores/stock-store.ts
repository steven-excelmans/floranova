import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, watch } from 'vue';
import { subscribeStock, setStock as fsSetStock } from 'src/services/stock-service';
import { useAuth } from 'src/composables/useAuth';

const STORAGE_KEY = 'floranova-stock';

function loadLocalStock(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    // ignore corrupt data
  }
  return {};
}

function saveLocalStock(stock: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
}

export const useStockStore = defineStore('stock', () => {
  const stock = ref<Record<string, boolean>>(loadLocalStock());
  const { user, isAuthenticated } = useAuth();
  let unsubscribe: (() => void) | null = null;

  watch(
    () => user.value,
    async (currentUser) => {
      unsubscribe?.();
      unsubscribe = null;

      if (currentUser) {
        // Migrate localStorage data to Firestore
        const localData = loadLocalStock();
        const localEntries = Object.entries(localData);
        if (localEntries.length > 0) {
          for (const [plantId, inStock] of localEntries) {
            await fsSetStock(currentUser.uid, plantId, inStock);
          }
          localStorage.removeItem(STORAGE_KEY);
        }

        // Subscribe to Firestore
        unsubscribe = subscribeStock(currentUser.uid, (firestoreStock) => {
          stock.value = firestoreStock;
        });
      } else {
        stock.value = loadLocalStock();
      }
    },
    { immediate: true },
  );

  function isInStock(plantId: string): boolean {
    return stock.value[plantId] !== false;
  }

  async function toggleStock(plantId: string) {
    const newValue = !isInStock(plantId);
    stock.value[plantId] = newValue;

    if (isAuthenticated.value && user.value) {
      await fsSetStock(user.value.uid, plantId, newValue);
    } else {
      saveLocalStock(stock.value);
    }
  }

  async function setStock(plantId: string, inStock: boolean) {
    stock.value[plantId] = inStock;

    if (isAuthenticated.value && user.value) {
      await fsSetStock(user.value.uid, plantId, inStock);
    } else {
      saveLocalStock(stock.value);
    }
  }

  return { stock, isInStock, toggleStock, setStock };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStockStore, import.meta.hot));
}
