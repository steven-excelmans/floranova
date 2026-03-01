import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Planting, PlantingLocation } from 'src/types/planting';
import {
  subscribePlantings,
  savePlanting,
  removePlanting as fsRemovePlanting,
  updatePlantingMilestones,
} from 'src/services/planting-service';
import { useAuth } from 'src/composables/useAuth';

const STORAGE_KEY = 'floranova-plantings';

function loadLocalPlantings(): Planting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Planting[];
  } catch {
    // ignore corrupt data
  }
  return [];
}

function saveLocalPlantings(plantings: Planting[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plantings));
}

export const usePlantingStore = defineStore('planting', () => {
  const plantings = ref<Planting[]>(loadLocalPlantings());
  const { user, isAuthenticated } = useAuth();
  let unsubscribe: (() => void) | null = null;

  // When user authenticates, subscribe to Firestore and migrate local data
  watch(
    () => user.value,
    async (currentUser) => {
      unsubscribe?.();
      unsubscribe = null;

      if (currentUser) {
        // Migrate localStorage data to Firestore on first auth
        const localData = loadLocalPlantings();
        if (localData.length > 0) {
          for (const planting of localData) {
            await savePlanting(currentUser.uid, planting);
          }
          localStorage.removeItem(STORAGE_KEY);
        }

        // Subscribe to Firestore
        unsubscribe = subscribePlantings(currentUser.uid, (firestorePlantings) => {
          plantings.value = firestorePlantings;
        });
      } else {
        plantings.value = loadLocalPlantings();
      }
    },
    { immediate: true },
  );

  const activePlantings = computed(() =>
    [...plantings.value].sort((a, b) => b.dateSeeded.localeCompare(a.dateSeeded)),
  );

  async function addPlanting(data: {
    plantId: string;
    dateSeeded: string;
    amount: number;
    location: PlantingLocation;
    notes: string;
  }) {
    const planting: Planting = {
      id: crypto.randomUUID(),
      ...data,
      completedMilestones: [],
      createdAt: new Date().toISOString(),
    };

    if (isAuthenticated.value && user.value) {
      await savePlanting(user.value.uid, planting);
    } else {
      plantings.value.push(planting);
      saveLocalPlantings(plantings.value);
    }
    return planting;
  }

  async function removePlanting(id: string) {
    if (isAuthenticated.value && user.value) {
      await fsRemovePlanting(user.value.uid, id);
    } else {
      plantings.value = plantings.value.filter((p) => p.id !== id);
      saveLocalPlantings(plantings.value);
    }
  }

  async function completeMilestone(plantingId: string, milestoneId: string) {
    const planting = plantings.value.find((p) => p.id === plantingId);
    if (planting && !planting.completedMilestones.includes(milestoneId)) {
      planting.completedMilestones.push(milestoneId);

      if (isAuthenticated.value && user.value) {
        await updatePlantingMilestones(user.value.uid, plantingId, planting.completedMilestones);
      } else {
        saveLocalPlantings(plantings.value);
      }
    }
  }

  async function uncompleteMilestone(plantingId: string, milestoneId: string) {
    const planting = plantings.value.find((p) => p.id === plantingId);
    if (planting) {
      planting.completedMilestones = planting.completedMilestones.filter((m) => m !== milestoneId);

      if (isAuthenticated.value && user.value) {
        await updatePlantingMilestones(user.value.uid, plantingId, planting.completedMilestones);
      } else {
        saveLocalPlantings(plantings.value);
      }
    }
  }

  return { plantings, activePlantings, addPlanting, removePlanting, completeMilestone, uncompleteMilestone };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlantingStore, import.meta.hot));
}
