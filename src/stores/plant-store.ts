import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Plant, PlantType, SunRequirement, PropagationType } from 'src/types/plant';
import { normalizeMonthRange } from 'src/types/plant';
import { subscribePlants } from 'src/services/plant-service';
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
  const plants = ref<Plant[]>(plantsData.map(normalizePlant));
  const search = ref('');
  const typeFilter = ref<PlantType | null>(null);
  const sunFilter = ref<SunRequirement | null>(null);
  const propagationFilter = ref<PropagationType | null>(null);
  const stockOnly = ref(false);
  const firestoreLoaded = ref(false);

  // Subscribe to Firestore plants — merge with static data
  let unsubscribe: (() => void) | null = null;

  function initFirestore() {
    if (unsubscribe) return;
    try {
      unsubscribe = subscribePlants((firestorePlants) => {
        // Build a map of Firestore plants by ID (source of truth for overrides)
        const firestoreMap = new Map(firestorePlants.map((p) => [p.id, p]));

        // Start with static plants, merge Firestore overrides on top
        const merged = plantsData.map((staticPlant) => {
          const firestoreVersion = firestoreMap.get(staticPlant.id);
          if (!firestoreVersion) return staticPlant;
          // Spread static data first, then Firestore fields on top
          return { ...staticPlant, ...firestoreVersion };
        });

        // Add any Firestore-only plants (not in static data)
        const staticIds = new Set(plantsData.map((p) => p.id));
        for (const fp of firestorePlants) {
          if (!staticIds.has(fp.id)) merged.push(fp);
        }

        plants.value = merged.map(normalizePlant);
        firestoreLoaded.value = true;
      });
    } catch {
      // Firebase not configured — keep using static data
    }
  }

  function cleanup() {
    unsubscribe?.();
    unsubscribe = null;
  }

  // Auto-init when store is used
  initFirestore();

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
    firestoreLoaded,
    filteredPlants,
    groupedBySpecies,
    hasActiveFilter,
    getPlantById,
    resetFilters,
    cleanup,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlantStore, import.meta.hot));
}
