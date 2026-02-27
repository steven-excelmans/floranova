import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Planting, PlantingLocation } from 'src/types/planting';

const STORAGE_KEY = 'floranova-plantings';

function loadPlantings(): Planting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Planting[];
  } catch {
    // ignore corrupt data
  }
  return [];
}

function savePlantings(plantings: Planting[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plantings));
}

export const usePlantingStore = defineStore('planting', () => {
  const plantings = ref<Planting[]>(loadPlantings());

  const activePlantings = computed(() =>
    [...plantings.value].sort((a, b) => b.dateSeeded.localeCompare(a.dateSeeded)),
  );

  function addPlanting(data: {
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
    plantings.value.push(planting);
    savePlantings(plantings.value);
    return planting;
  }

  function removePlanting(id: string) {
    plantings.value = plantings.value.filter((p) => p.id !== id);
    savePlantings(plantings.value);
  }

  function completeMilestone(plantingId: string, milestoneId: string) {
    const planting = plantings.value.find((p) => p.id === plantingId);
    if (planting && !planting.completedMilestones.includes(milestoneId)) {
      planting.completedMilestones.push(milestoneId);
      savePlantings(plantings.value);
    }
  }

  function uncompleteMilestone(plantingId: string, milestoneId: string) {
    const planting = plantings.value.find((p) => p.id === plantingId);
    if (planting) {
      planting.completedMilestones = planting.completedMilestones.filter((m) => m !== milestoneId);
      savePlantings(plantings.value);
    }
  }

  return { plantings, activePlantings, addPlanting, removePlanting, completeMilestone, uncompleteMilestone };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlantingStore, import.meta.hot));
}
