<template>
  <q-page class="calendar-page">
    <!-- Controls bar -->
    <div class="calendar-controls">
      <!-- View toggle: pill-shaped segmented control -->
      <div class="view-toggle">
        <button
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': viewMode === 'timeline' }"
          @click="viewMode = 'timeline'"
        >
          {{ t('calendar.timeline') }}
        </button>
        <button
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': viewMode === 'monthly' }"
          @click="viewMode = 'monthly'"
        >
          {{ t('calendar.monthly') }}
        </button>
      </div>

      <!-- Stock toggle: custom checkbox -->
      <label class="stock-toggle">
        <div class="stock-toggle__box" :class="{ 'stock-toggle__box--active': stockOnly }" @click="stockOnly = !stockOnly">
          <span class="material-icons-outlined">check</span>
        </div>
        <span class="stock-toggle__label">{{ t('calendar.inStockOnly') }}</span>
      </label>
    </div>

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
import TimelineView from 'src/components/calendar/TimelineView.vue';
import MonthlyView from 'src/components/calendar/MonthlyView.vue';

const { t } = useI18n();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();

const viewMode = ref<'timeline' | 'monthly'>('timeline');
const stockOnly = ref(false);

const visiblePlants = computed(() => {
  if (!stockOnly.value) return plantStore.plants;
  return plantStore.plants.filter((p) => stockStore.isInStock(p.id));
});
</script>

<style scoped lang="scss">
.calendar-page {
  background: var(--sand);
  min-height: 100%;
}

/* Controls bar below the app header */
.calendar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--sand);
}

/* ── View toggle ── */
.view-toggle {
  flex: 1;
  display: flex;
  background: var(--border-light);
  border-radius: var(--radius-pill);
  padding: 3px;
}

.view-toggle__btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &--active {
    background: var(--warm-white);
    color: var(--deep-brown);
    box-shadow: 0 1px 4px rgba(53, 43, 34, 0.08), 0 0.5px 1px rgba(53, 43, 34, 0.05);
    font-weight: 600;
  }
}

/* ── Stock toggle ── */
.stock-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  padding: 6px 0;

  &__box {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid var(--border);
    background: var(--warm-white);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;

    .material-icons-outlined {
      font-size: 13px;
      color: white;
      opacity: 0;
      transition: opacity 0.15s;
    }

    &--active {
      background: var(--moss);
      border-color: var(--moss);

      .material-icons-outlined {
        opacity: 1;
      }
    }
  }

  &__label {
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--muted);
  }
}
</style>
