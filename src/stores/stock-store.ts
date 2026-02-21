import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'floranova-stock';

function loadStock(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    // ignore corrupt data
  }
  return {};
}

function saveStock(stock: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
}

export const useStockStore = defineStore('stock', () => {
  const stock = ref<Record<string, boolean>>(loadStock());

  function isInStock(plantId: string): boolean {
    // Default to in-stock if no explicit value set
    return stock.value[plantId] !== false;
  }

  function toggleStock(plantId: string) {
    stock.value[plantId] = !stock.value[plantId];
    saveStock(stock.value);
  }

  function setStock(plantId: string, inStock: boolean) {
    stock.value[plantId] = inStock;
    saveStock(stock.value);
  }

  return { stock, isInStock, toggleStock, setStock };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStockStore, import.meta.hot));
}
