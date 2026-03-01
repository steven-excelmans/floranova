import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Plant, PlantType, SunRequirement } from 'src/types/plant';
import plantsData from 'src/data/plants';

export const usePlantStore = defineStore('plants', () => {
  const plants = ref(plantsData);
  const search = ref('');
  const typeFilter = ref<PlantType | null>(null);
  const sunFilter = ref<SunRequirement | null>(null);
  const stockOnly = ref(false);

  const filteredPlants = computed(() => {
    return plants.value.filter((plant) => {
      if (typeFilter.value && plant.type !== typeFilter.value) return false;
      if (sunFilter.value && plant.sun !== sunFilter.value) return false;

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
    return groups;
  });

  const hasActiveFilter = computed(
    () =>
      search.value !== '' ||
      typeFilter.value !== null ||
      sunFilter.value !== null ||
      stockOnly.value,
  );

  function getPlantById(id: string): Plant | undefined {
    return plants.value.find((p) => p.id === id);
  }

  function resetFilters() {
    search.value = '';
    typeFilter.value = null;
    sunFilter.value = null;
    stockOnly.value = false;
  }

  return {
    plants,
    search,
    typeFilter,
    sunFilter,
    stockOnly,
    filteredPlants,
    groupedBySpecies,
    hasActiveFilter,
    getPlantById,
    resetFilters,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlantStore, import.meta.hot));
}
