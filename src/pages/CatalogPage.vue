<template>
  <q-page class="catalog-page">
    <!-- Content area -->
    <div class="content">
      <!-- Info bar: counts + calendar legend -->
      <div class="info-bar">
        <div class="info-counts">
          <div class="count-item">
            <svg class="count-icon" viewBox="0 0 24 24" fill="none" stroke="var(--moss)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="2.5"/>
              <ellipse cx="12" cy="6" rx="2.2" ry="4"/>
              <ellipse cx="12" cy="6" rx="2.2" ry="4" transform="rotate(72 12 12)"/>
              <ellipse cx="12" cy="6" rx="2.2" ry="4" transform="rotate(144 12 12)"/>
              <ellipse cx="12" cy="6" rx="2.2" ry="4" transform="rotate(216 12 12)"/>
              <ellipse cx="12" cy="6" rx="2.2" ry="4" transform="rotate(288 12 12)"/>
            </svg>
            <span class="count-num">{{ totalPlants }}</span>
          </div>
          <div class="count-item">
            <svg class="count-icon" viewBox="0 0 24 24" fill="none" stroke="var(--moss)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 8C17 8 21 4 21 3C21 3 17 3 14 5C11 7 7 12 7 16C7 18.5 8 21 12 21C16 21 17 18 17 16C17 13 14 10 12 9"/>
              <path d="M7 16L3 20"/>
              <path d="M10 13L7 10"/>
              <path d="M13 15L11 18"/>
            </svg>
            <span class="count-num">{{ visibleGroups.size }}</span>
          </div>
        </div>

        <div class="info-legend">
          <div class="legend-dot-group">
            <span class="legend-dot" style="background: var(--cal-indoor);" />
            <span class="legend-label">{{ t('catalog.calIndoor') }}</span>
          </div>
          <div class="legend-dot-group">
            <span class="legend-dot" style="background: var(--cal-cold);" />
            <span class="legend-label">{{ t('catalog.calColdFrame') }}</span>
          </div>
          <div class="legend-dot-group">
            <span class="legend-dot" style="background: var(--cal-outdoor);" />
            <span class="legend-label">{{ t('catalog.calOutdoor') }}</span>
          </div>
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

// ── Info bar (counts + legend) ──
.info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 10px;
}

.info-counts {
  display: flex;
  align-items: center;
  gap: 16px;
}

.count-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.count-icon {
  width: 18px;
  height: 18px;
  opacity: 0.45;
}

.count-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1;
}

.info-legend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 10.5px;
  color: var(--muted);
  font-weight: 500;
  line-height: 1;
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
  margin-bottom: 4px;
}

.species-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 4px;
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
