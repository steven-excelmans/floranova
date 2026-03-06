import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'floranova-favorites';

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore corrupt data
  }
  return new Set();
}

function saveFavorites(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref<Set<string>>(loadFavorites());

  function isFavorite(plantId: string): boolean {
    return favoriteIds.value.has(plantId);
  }

  function toggleFavorite(plantId: string) {
    const next = new Set(favoriteIds.value);
    if (next.has(plantId)) {
      next.delete(plantId);
    } else {
      next.add(plantId);
    }
    favoriteIds.value = next;
    saveFavorites(next);
  }

  return { favoriteIds, isFavorite, toggleFavorite };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot));
}
