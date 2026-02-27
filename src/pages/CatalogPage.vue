<template>
  <q-page class="catalog-page">
    <!-- Sticky filter header -->
    <div class="filters-sticky">
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
    </div>

    <!-- Content area -->
    <div class="content">
      <!-- Result count -->
      <div class="result-count">
        <strong>{{ totalPlants }}</strong> {{ t('catalog.plants') }} {{ t('catalog.in') }}
        <strong>{{ visibleGroups.size }}</strong> {{ t('catalog.species') }}
      </div>

      <!-- Calendar legend -->
      <div class="cal-legend">
        <div class="cal-legend-item">
          <span class="cal-legend-bar" style="background: var(--cal-indoor);" />
          {{ t('catalog.calIndoor') }}
        </div>
        <div class="cal-legend-item">
          <span class="cal-legend-bar" style="background: var(--cal-cold);" />
          {{ t('catalog.calColdFrame') }}
        </div>
        <div class="cal-legend-item">
          <span class="cal-legend-bar" style="background: var(--cal-outdoor);" />
          {{ t('catalog.calOutdoor') }}
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="visibleGroups.size === 0" class="empty-state">
        <span class="material-icons-outlined empty-icon">search_off</span>
        <div class="empty-text">{{ t('catalog.noResults') }}</div>
      </div>

      <!-- Species groups -->
      <section
        v-for="[species, plants] in visibleGroups"
        :key="species"
        class="species-group"
      >
        <div class="species-header">
          <h2 class="species-name">{{ species }}</h2>
          <span class="species-count">
            {{ plants.length }}
            {{ plants.length === 1 ? t('catalog.variety') : t('catalog.varieties') }}
          </span>
        </div>

        <PlantCard
          v-for="plant in plants"
          :key="plant.id"
          :plant="plant"
          :in-stock="stockStore.isInStock(plant.id)"
          @select="router.push(`/plant/${$event}`)"
          @toggle-stock="stockStore.toggleStock($event)"
        />
      </section>
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

const totalPlants = computed(() => {
  let count = 0;
  for (const plants of visibleGroups.value.values()) {
    count += plants.length;
  }
  return count;
});
</script>

<style scoped lang="scss">
.catalog-page {
  background: var(--sand);
  min-height: 100vh;
}

// ── Sticky filters area ──
.filters-sticky {
  position: sticky;
  top: var(--header-height, 50px);
  z-index: 50;
  background: var(--warm-white);
  box-shadow: var(--shadow-header);
  padding-top: 14px;
}

// ── Content area ──
.content {
  padding: 10px 16px 100px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 55% 45% 48% 52% / 44% 56% 48% 52%;
    background: var(--clay);
    opacity: 0.02;
    top: 600px;
    left: -30px;
    pointer-events: none;
  }
}

// ── Result count ──
.result-count {
  font-size: 12px;
  color: var(--muted);
  padding: 4px 4px 2px;
  font-weight: 400;

  strong {
    font-weight: 600;
    color: var(--deep-brown);
  }
}

// ── Calendar legend ──
.cal-legend {
  display: flex;
  gap: 14px;
  padding: 6px 4px 16px;
}

.cal-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
  letter-spacing: 0.2px;
}

.cal-legend-bar {
  width: 10px;
  height: 3px;
  border-radius: 1.5px;
  flex-shrink: 0;
}

// ── Empty state ──
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 16px;
  color: var(--muted);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
}

// ── Species groups ──
.species-group {
  margin-bottom: 8px;
}

.species-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 14px 4px 10px;
}

.species-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1.2;
}

.species-count {
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 400;
  color: var(--muted);
}
</style>
