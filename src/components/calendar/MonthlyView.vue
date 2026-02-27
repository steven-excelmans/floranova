<template>
  <div class="monthly-view">
    <!-- Month picker -->
    <div class="month-picker">
      <button class="month-picker__arrow" @click="changeMonth(-1)" :aria-label="t('calendar.prevMonth')">
        <span class="material-icons-outlined">chevron_left</span>
      </button>

      <div class="month-picker__center">
        <div class="month-picker__label">{{ t(`monthsFull.${selectedMonth}`) }}</div>
        <div class="month-picker__year">{{ currentYear }}</div>
      </div>

      <button class="month-picker__arrow" @click="changeMonth(1)" :aria-label="t('calendar.nextMonth')">
        <span class="material-icons-outlined">chevron_right</span>
      </button>
    </div>

    <!-- Sections -->
    <div class="monthly-sections">
      <!-- Indoor Sowing -->
      <div class="monthly-section">
        <div class="monthly-section__header">
          <div class="monthly-section__dot monthly-section__dot--indoor" />
          <span class="monthly-section__title">{{ t('calendar.indoorSowing') }}</span>
          <span class="monthly-section__count">{{ indoorPlants.length }}</span>
        </div>
        <template v-if="indoorPlants.length">
          <MonthlyActionCard
            v-for="plant in indoorPlants"
            :key="plant.id"
            :plant="plant"
            @select="$emit('select', $event)"
          />
        </template>
        <div v-else class="empty-state">
          <span class="material-icons-outlined">grass</span>
          <div class="empty-state__text">{{ t('calendar.nothingIndoor') }}</div>
        </div>
      </div>

      <!-- Cold Greenhouse -->
      <div class="monthly-section">
        <div class="monthly-section__header">
          <div class="monthly-section__dot monthly-section__dot--cold" />
          <span class="monthly-section__title">{{ t('calendar.coldGreenhouse') }}</span>
          <span class="monthly-section__count">{{ coldGreenhousePlants.length }}</span>
        </div>
        <template v-if="coldGreenhousePlants.length">
          <MonthlyActionCard
            v-for="plant in coldGreenhousePlants"
            :key="plant.id"
            :plant="plant"
            @select="$emit('select', $event)"
          />
        </template>
        <div v-else class="empty-state">
          <span class="material-icons-outlined">grass</span>
          <div class="empty-state__text">{{ t('calendar.nothingCold') }}</div>
        </div>
      </div>

      <!-- Outdoor -->
      <div class="monthly-section">
        <div class="monthly-section__header">
          <div class="monthly-section__dot monthly-section__dot--outdoor" />
          <span class="monthly-section__title">{{ t('calendar.outdoor') }}</span>
          <span class="monthly-section__count">{{ outdoorPlants.length }}</span>
        </div>
        <template v-if="outdoorPlants.length">
          <MonthlyActionCard
            v-for="plant in outdoorPlants"
            :key="plant.id"
            :plant="plant"
            @select="$emit('select', $event)"
          />
        </template>
        <div v-else class="empty-state">
          <span class="material-icons-outlined">grass</span>
          <div class="empty-state__text">{{ t('calendar.nothingOutdoor') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Plant } from 'src/types/plant';
import { getPlantsForMonth, getCurrentMonth } from 'src/composables/useCalendar';
import MonthlyActionCard from './MonthlyActionCard.vue';

const props = defineProps<{ plants: Plant[] }>();
defineEmits<{ select: [id: string] }>();

const { t } = useI18n();
const selectedMonth = ref(getCurrentMonth());
const currentYear = new Date().getFullYear();

function changeMonth(delta: number): void {
  selectedMonth.value = ((selectedMonth.value - 1 + delta + 12) % 12) + 1;
}

const indoorPlants = computed(() =>
  getPlantsForMonth(props.plants, selectedMonth.value, 'indoorSowing'),
);

const coldGreenhousePlants = computed(() =>
  getPlantsForMonth(props.plants, selectedMonth.value, 'coldGreenhouse'),
);

const outdoorPlants = computed(() =>
  getPlantsForMonth(props.plants, selectedMonth.value, 'outdoor'),
);
</script>

<style scoped lang="scss">
.monthly-view {
  display: block;
}

/* Month picker */
.month-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 18px 20px 10px;
}

.month-picker__center {
  min-width: 150px;
  text-align: center;
  user-select: none;
}

.month-picker__label {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: var(--deep-brown);
  line-height: 1.15;
}

.month-picker__year {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 400;
  color: var(--muted);
  margin-top: 1px;
}

.month-picker__arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--warm-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 0;

  .material-icons-outlined {
    font-size: 20px;
    color: var(--muted);
    transition: color 0.2s;
  }

  &:hover {
    border-color: var(--moss);
    background: var(--moss-pale);

    .material-icons-outlined {
      color: var(--moss);
    }
  }

  &:active {
    transform: scale(0.94);
  }
}

/* Sections wrapper */
.monthly-sections {
  padding: 0 16px 16px;
}

/* Individual section */
.monthly-section {
  margin-bottom: 24px;
}

.monthly-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 0 4px;
}

.monthly-section__dot {
  width: 10px;
  height: 10px;
  border-radius: 4px;
  flex-shrink: 0;

  &--indoor  { background: var(--cal-indoor); }
  &--cold    { background: var(--cal-cold); }
  &--outdoor { background: var(--cal-outdoor); }
}

.monthly-section__title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--deep-brown);
  letter-spacing: 0.3px;
}

.monthly-section__count {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  background: var(--sand);
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  margin-left: 2px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 32px 20px;
  background: var(--warm-white);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border);

  .material-icons-outlined {
    font-size: 36px;
    color: var(--border);
    display: block;
    margin-bottom: 8px;
  }

  &__text {
    font-family: var(--font-body);
    font-size: 13.5px;
    color: var(--muted);
    font-weight: 400;
  }
}
</style>
