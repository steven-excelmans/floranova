import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Plant, PlantType, SunRequirement, PropagationType } from 'src/types/plant';
import { normalizeMonthRange } from 'src/types/plant';
import { subscribePlants, createPlant } from 'src/services/plant-service';
import plantsData from 'src/data/plants';

function normalizePlant(plant: Plant): Plant {
  const cal = plant.calendar;
  return {
    ...plant,
    propagation: plant.propagation ?? 'seed',
    calendar: {
      indoorSowing: normalizeMonthRange(cal.indoorSowing),
      coldGreenhouse: normalizeMonthRange(cal.coldGreenhouse),
      outdoor: normalizeMonthRange(cal.outdoor),
      harvestPeriod: normalizeMonthRange(cal.harvestPeriod ?? (cal as Record<string, unknown>).bloomPeriod as number[] | null),
    },
  };
}

export const usePlantStore = defineStore('plants', () => {
  const plants = ref<Plant[]>([]);
  const search = ref('');
  const typeFilter = ref<PlantType | null>(null);
  const sunFilter = ref<SunRequirement | null>(null);
  const propagationFilter = ref<PropagationType | null>(null);
  const stockOnly = ref(false);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;

  function init() {
    if (unsubscribe) return;
    try {
      unsubscribe = subscribePlants((firestorePlants) => {
        plants.value = firestorePlants.map(normalizePlant);
        loading.value = false;
      });
    } catch {
      // Firebase not configured — stay empty
      loading.value = false;
    }
  }

  function cleanup() {
    unsubscribe?.();
    unsubscribe = null;
  }

  // Auto-init when store is used
  init();

  /**
   * Migrate static seed data to Firestore.
   * Only creates plants that don't already exist in Firestore.
   * Returns the number of plants migrated.
   */
  async function migrateStaticData(): Promise<number> {
    const existingIds = new Set(plants.value.map((p) => p.id));
    const toMigrate = plantsData.filter((p) => !existingIds.has(p.id));

    for (const plant of toMigrate) {
      await createPlant(normalizePlant(plant));
    }

    return toMigrate.length;
  }

  const filteredPlants = computed(() => {
    return plants.value.filter((plant) => {
      // Pending plants are admin-only, hide from public views
      if (plant.status === 'pending') return false;
      if (typeFilter.value && plant.type !== typeFilter.value) return false;
      if (sunFilter.value && plant.sun !== sunFilter.value) return false;
      if (propagationFilter.value && plant.propagation !== propagationFilter.value) return false;

      if (search.value) {
        const q = search.value.toLowerCase();
        const matchesName =
          plant.name.nl.toLowerCase().includes(q) ||
          plant.name.en.toLowerCase().includes(q);
        const matchesSpecies = plant.species.toLowerCase().includes(q);
        const matchesVariety = plant.variety?.toLowerCase().includes(q);
        const matchesLatin = plant.latinName.toLowerCase().includes(q);
        if (!matchesName && !matchesSpecies && !matchesVariety && !matchesLatin)
          return false;
      }

      return true;
    });
  });

  const groupedBySpecies = computed(() => {
    const groups = new Map<string, Plant[]>();
    for (const plant of filteredPlants.value) {
      const key = plant.species;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(plant);
    }
    // Sort species alphabetically, and varieties within each species
    const sorted = new Map<string, Plant[]>();
    const sortedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));
    for (const key of sortedKeys) {
      const plants = groups.get(key)!;
      plants.sort((a, b) => (a.variety ?? '').localeCompare(b.variety ?? ''));
      sorted.set(key, plants);
    }
    return sorted;
  });

  const hasActiveFilter = computed(
    () =>
      search.value !== '' ||
      typeFilter.value !== null ||
      sunFilter.value !== null ||
      propagationFilter.value !== null ||
      stockOnly.value,
  );

  function getPlantById(id: string): Plant | undefined {
    return plants.value.find((p) => p.id === id);
  }

  function resetFilters() {
    search.value = '';
    typeFilter.value = null;
    sunFilter.value = null;
    propagationFilter.value = null;
    stockOnly.value = false;
  }

  return {
    plants,
    search,
    typeFilter,
    sunFilter,
    propagationFilter,
    stockOnly,
    loading,
    filteredPlants,
    groupedBySpecies,
    hasActiveFilter,
    getPlantById,
    resetFilters,
    migrateStaticData,
    cleanup,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlantStore, import.meta.hot));
}
