<template>
  <div class="monthly-view">
    <!-- Month picker -->
    <div class="month-picker">
      <button class="month-picker__arrow" :aria-label="t('calendar.prevMonth')" @click="changeMonth(-1)">
        <span class="material-icons-outlined">chevron_left</span>
      </button>

      <div class="month-picker__center">
        <div class="month-picker__label">{{ t(`monthsFull.${selectedMonth}`) }}</div>
      </div>

      <button class="month-picker__arrow" :aria-label="t('calendar.nextMonth')" @click="changeMonth(1)">
        <span class="material-icons-outlined">chevron_right</span>
      </button>
    </div>

    <!-- Sections -->
    <div class="monthly-sections">
      <!-- Indoor Sowing -->
      <div v-if="indoorPlants.length" class="section-group">
        <div class="section-line">
          <div class="line" />
          <div class="label">
            <div class="dot indoor" />
            <span class="text">{{ t('calendar.indoorSowing') }}</span>
          </div>
          <span class="count">{{ indoorPlants.length }}</span>
          <div class="line" />
        </div>
        <MonthlyActionCard
          v-for="plant in indoorPlants"
          :key="plant.id"
          :plant="plant"
          :current-month="selectedMonth"
          @select="$emit('select', $event)"
        />
      </div>

      <!-- Cold Greenhouse -->
      <div v-if="coldGreenhousePlants.length" class="section-group">
        <div class="section-line">
          <div class="line" />
          <div class="label">
            <div class="dot cold" />
            <span class="text">{{ t('calendar.coldGreenhouse') }}</span>
          </div>
          <span class="count">{{ coldGreenhousePlants.length }}</span>
          <div class="line" />
        </div>
        <MonthlyActionCard
          v-for="plant in coldGreenhousePlants"
          :key="plant.id"
          :plant="plant"
          :current-month="selectedMonth"
          @select="$emit('select', $event)"
        />
      </div>

      <!-- Outdoor -->
      <div v-if="outdoorPlants.length" class="section-group">
        <div class="section-line">
          <div class="line" />
          <div class="label">
            <div class="dot outdoor" />
            <span class="text">{{ t('calendar.outdoor') }}</span>
          </div>
          <span class="count">{{ outdoorPlants.length }}</span>
          <div class="line" />
        </div>
        <MonthlyActionCard
          v-for="plant in outdoorPlants"
          :key="plant.id"
          :plant="plant"
          :current-month="selectedMonth"
          @select="$emit('select', $event)"
        />
      </div>

      <!-- Empty state -->
      <div v-if="!indoorPlants.length && !coldGreenhousePlants.length && !outdoorPlants.length" class="empty-state">
        <span class="material-icons-outlined">grass</span>
        <div class="empty-state__text">{{ t('calendar.nothingToDo') }}</div>
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

/* ── Month picker ── */
.month-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 20px 12px;
}

.month-picker__center {
  min-width: 160px;
  text-align: center;
  user-select: none;
}

.month-picker__label {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--deep-brown);
  line-height: 1.15;
  letter-spacing: -0.5px;
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

/* ── Sections ── */
.monthly-sections {
  padding: 0 0 24px;
}

.section-group {
  margin-bottom: 8px;
}

/* ── Section divider line ── */
.section-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  margin-bottom: 12px;
  margin-top: 8px;
}

.section-line .line {
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

.section-line .label {
  display: flex;
  align-items: center;
  gap: 7px;
}

.section-line .dot {
  width: 10px;
  height: 10px;
  border-radius: 4px;

  &.indoor  { background: var(--cal-indoor); }
  &.cold    { background: var(--cal-cold); }
  &.outdoor { background: var(--cal-outdoor); }
}

.section-line .text {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--deep-brown);
}

.section-line .count {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  background: var(--warm-white);
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-light);
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 48px 20px;

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
