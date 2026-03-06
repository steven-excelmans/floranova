<template>
  <q-page class="catalog-page">
    <div class="content">
      <!-- Info bar: counts + legend + filter toggle -->
      <div class="info-bar">
        <div class="info-counts">
          <div class="count-item">
            <span class="material-icons-outlined count-icon">eco</span>
            <span class="count-num">{{ visibleGroups.size }}</span>
          </div>
          <div class="count-item">
            <span class="material-icons-outlined count-icon">local_florist</span>
            <span class="count-num">{{ totalPlants }}</span>
          </div>
        </div>

        <div class="info-right">
          <button
            class="fav-toggle"
            :class="{ 'fav-toggle--active': favoritesOnly }"
            @click="favoritesOnly = !favoritesOnly"
          >
            <span class="material-icons-outlined">{{ favoritesOnly ? 'favorite' : 'favorite_border' }}</span>
          </button>

          <button
            class="filter-toggle"
            :class="{ 'filter-toggle--active': filterOpen, 'filter-toggle--has-filter': plantStore.hasActiveFilter }"
            @click="filterOpen = !filterOpen"
          >
            <span class="material-icons-outlined">tune</span>
            <span v-if="plantStore.hasActiveFilter" class="filter-toggle__dot" />
          </button>
        </div>
      </div>

      <!-- Inline collapsible filters -->
      <Transition name="filter-collapse">
        <div v-if="filterOpen" class="filter-panel">
          <PlantFilters
            :search="plantStore.search"
            :type-filter="plantStore.typeFilter"
            :sun-filter="plantStore.sunFilter"
            :propagation-filter="plantStore.propagationFilter"
            :stock-only="plantStore.stockOnly"
            @update:search="plantStore.search = $event"
            @update:type-filter="plantStore.typeFilter = $event"
            @update:sun-filter="plantStore.sunFilter = $event"
            @update:propagation-filter="plantStore.propagationFilter = $event"
            @update:stock-only="plantStore.stockOnly = $event"
          />
        </div>
      </Transition>

      <!-- Empty state -->
      <div v-if="visibleGroups.size === 0" class="empty-state">
        <span class="material-icons-outlined empty-icon">{{ favoritesOnly ? 'favorite_border' : 'search_off' }}</span>
        <div class="empty-text">{{ favoritesOnly ? t('catalog.noFavorites') : t('catalog.noResults') }}</div>
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
          :is-favorite="favoritesStore.isFavorite(plant.id)"
          @select="router.push(`/plant/${$event}`)"
          @toggle-stock="stockStore.toggleStock($event)"
        />
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { useStockStore } from 'src/stores/stock-store';
import { useFavoritesStore } from 'src/stores/favorites-store';
import PlantCard from 'src/components/catalog/PlantCard.vue';
import PlantFilters from 'src/components/catalog/PlantFilters.vue';

const { t } = useI18n();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();
const favoritesStore = useFavoritesStore();

const filterOpen = ref(false);
const favoritesOnly = ref(false);

const visibleGroups = computed(() => {
  const source = plantStore.groupedBySpecies;
  const result = new Map<string, typeof plantStore.filteredPlants>();

  for (const [species, plants] of source) {
    let filtered = plantStore.stockOnly
      ? plants.filter((p) => stockStore.isInStock(p.id))
      : plants;
    if (favoritesOnly.value) {
      filtered = filtered.filter((p) => favoritesStore.isFavorite(p.id));
    }
    if (filtered.length === 0) continue;
    result.set(species, filtered);
  }
  return result;
});

const totalPlants = computed(() => {
  let count = 0;
  for (const plants of visibleGroups.value.values()) count += plants.length;
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

// ── Info bar (counts + legend + filter) ──
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
  font-size: 17px;
  color: var(--moss);
  opacity: 0.45;
}

.count-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1;
}

.info-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

// ── Favorites toggle button ──
.fav-toggle {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: all 0.25s ease;
  padding: 0;
  flex-shrink: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  .material-icons-outlined {
    font-size: 15px;
    color: inherit;
  }

  &:hover {
    border-color: var(--flower);
    color: var(--flower);
  }

  &--active {
    background: var(--flower);
    border-color: var(--flower);
    color: var(--warm-white);

    &:hover {
      background: var(--flower);
      border-color: var(--flower);
      color: var(--warm-white);
    }
  }
}

// ── Filter toggle button ──
.filter-toggle {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: all 0.25s ease;
  padding: 0;
  flex-shrink: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  .material-icons-outlined {
    font-size: 16px;
    color: inherit;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }

  &--active {
    background: var(--deep-brown);
    border-color: var(--deep-brown);
    color: var(--warm-white);

    &:hover {
      background: var(--deep-brown);
      border-color: var(--deep-brown);
      color: var(--warm-white);
    }
  }

  &--has-filter:not(.filter-toggle--active) {
    border-color: var(--clay);
    color: var(--clay);
  }
}

.filter-toggle__dot {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--clay);
  border: 2px solid var(--sand);
}

// ── Inline filter panel ──
.filter-panel {
  background: var(--warm-white);
  border-radius: var(--radius-card);
  margin-bottom: 10px;
  padding-top: 14px;
  box-shadow: 0 1px 4px rgba(53, 43, 34, 0.06);
}

// ── Filter collapse transition ──
.filter-collapse-enter-active,
.filter-collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: 300px;
}

.filter-collapse-enter-from,
.filter-collapse-leave-to {
  max-height: 0;
  padding-top: 0;
  margin-bottom: 0;
  opacity: 0;
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
