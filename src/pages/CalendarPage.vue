<template>
  <q-page class="calendar-page">
    <!-- Top bar: toggle + filter -->
    <div class="top-bar">
      <div class="seg-toggle">
        <button
          class="seg-toggle__btn"
          :class="{ 'seg-toggle__btn--active': viewMode === 'timeline' }"
          @click="viewMode = 'timeline'"
        >
          {{ t('calendar.timeline') }}
        </button>
        <button
          class="seg-toggle__btn"
          :class="{ 'seg-toggle__btn--active': viewMode === 'monthly' }"
          @click="viewMode = 'monthly'"
        >
          {{ t('calendar.monthly') }}
        </button>
      </div>

      <button
        class="filter-btn"
        :class="{ 'filter-btn--active': filterOpen, 'filter-btn--has-filter': plantStore.hasActiveFilter }"
        @click="filterOpen = !filterOpen"
      >
        <span class="material-icons-outlined">tune</span>
        <span v-if="plantStore.hasActiveFilter" class="filter-btn__dot" />
      </button>
    </div>

    <!-- Collapsible filter panel -->
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

    <!-- Views -->
    <TimelineView
      v-if="viewMode === 'timeline'"
      :plants="visiblePlants"
      @select="router.push(`/plant/${$event}`)"
    />

    <MonthlyView
      v-else
      :plants="visiblePlants"
      @select="router.push(`/plant/${$event}`)"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { useStockStore } from 'src/stores/stock-store';
import PlantFilters from 'src/components/catalog/PlantFilters.vue';
import TimelineView from 'src/components/calendar/TimelineView.vue';
import MonthlyView from 'src/components/calendar/MonthlyView.vue';

const { t } = useI18n();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();

const viewMode = ref<'timeline' | 'monthly'>('timeline');
const filterOpen = ref(false);

const visiblePlants = computed(() => {
  const filtered = plantStore.filteredPlants;
  if (!plantStore.stockOnly) return filtered;
  return filtered.filter((p) => stockStore.isInStock(p.id));
});
</script>

<style scoped lang="scss">
.calendar-page {
  background: var(--sand);
  min-height: 100%;
}

/* ── Top bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  gap: 12px;
}

/* ── Segmented toggle ── */
.seg-toggle {
  display: flex;
  background: var(--border-light);
  border-radius: var(--radius-pill);
  padding: 3px;
  gap: 2px;
}

.seg-toggle__btn {
  padding: 7px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  line-height: 1;

  &--active {
    background: var(--warm-white);
    color: var(--deep-brown);
    font-weight: 600;
    box-shadow: 0 1px 6px rgba(53, 43, 34, 0.08);
  }
}

/* ── Filter button ── */
.filter-btn {
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

  &--has-filter:not(.filter-btn--active) {
    border-color: var(--clay);
    color: var(--clay);
  }
}

.filter-btn__dot {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--clay);
  border: 2px solid var(--sand);
}

/* ── Filter panel ── */
.filter-panel {
  background: var(--warm-white);
  border-radius: var(--radius-card);
  margin: 0 16px 10px;
  padding-top: 14px;
  box-shadow: 0 1px 4px rgba(53, 43, 34, 0.06);
}

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
</style>
