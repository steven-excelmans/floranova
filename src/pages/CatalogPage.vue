<template>
  <q-page padding>
    <PlantFilters
      :search="plantStore.search"
      :type-filter="plantStore.typeFilter"
      :sun-filter="plantStore.sunFilter"
      :stock-only="plantStore.stockOnly"
      @update:search="plantStore.search = $event"
      @update:type-filter="plantStore.typeFilter = $event"
      @update:sun-filter="plantStore.sunFilter = $event"
      @update:stock-only="plantStore.stockOnly = $event"
    />

    <div v-if="visibleGroups.size === 0" class="text-center q-mt-xl text-grey-6">
      <q-icon name="search_off" size="48px" class="q-mb-sm" />
      <div>{{ t('catalog.noResults') }}</div>
    </div>

    <div v-for="[species, plants] in visibleGroups" :key="species" class="q-mt-md">
      <q-expansion-item
        :default-opened="true"
        header-class="text-weight-bold text-subtitle1"
      >
        <template #header>
          <q-item-section>
            <q-item-label class="text-capitalize">
              {{ species }}
              <span v-if="plants.length > 1" class="text-caption text-grey-6">
                ({{ plants.length }} {{ t('catalog.varieties') }})
              </span>
            </q-item-label>
          </q-item-section>
        </template>

        <div class="q-gutter-y-sm q-px-sm q-pb-sm">
          <PlantCard
            v-for="plant in plants"
            :key="plant.id"
            :plant="plant"
            :in-stock="stockStore.isInStock(plant.id)"
            @select="router.push(`/plant/${$event}`)"
            @toggle-stock="stockStore.toggleStock($event)"
          />
        </div>
      </q-expansion-item>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { useStockStore } from 'src/stores/stock-store';
import PlantFilters from 'src/components/catalog/PlantFilters.vue';
import PlantCard from 'src/components/catalog/PlantCard.vue';

const { t } = useI18n();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();

const visibleGroups = computed(() => {
  if (!plantStore.stockOnly) return plantStore.groupedBySpecies;

  const filtered = new Map<string, typeof plantStore.filteredPlants>();
  for (const [species, plants] of plantStore.groupedBySpecies) {
    const inStockPlants = plants.filter((p) => stockStore.isInStock(p.id));
    if (inStockPlants.length > 0) filtered.set(species, inStockPlants);
  }
  return filtered;
});
</script>
