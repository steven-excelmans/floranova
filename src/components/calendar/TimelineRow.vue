<template>
  <div class="plant-row">
    <!-- Sticky name column -->
    <div class="plant-name" @click="$emit('select', plant.id)">
      <div class="plant-name__avatar">
        <img
          v-if="coverUrl"
          :src="coverUrl"
          :alt="displayName"
          loading="lazy"
        />
        <span v-else class="material-icons-outlined">{{ plantIcon }}</span>
      </div>
      <div class="plant-name__text">
        <div class="plant-name__primary">
          {{ displayName }}
          <span
            v-if="showGermination && plant.propagation === 'seed' && plant.germination"
            class="germ-icon"
            :class="plant.germination"
          >
            <span class="material-icons-outlined">{{ plant.germination === 'light' ? 'light_mode' : 'dark_mode' }}</span>
          </span>
        </div>
        <div class="plant-name__latin">{{ plant.latinName }}</div>
      </div>
    </div>

    <!-- 12 month cells — fixed 3-slot layout -->
    <div
      v-for="m in 12"
      :key="m"
      class="timeline-cell"
      :class="{ 'timeline-cell--current': m === currentMonth }"
    >
      <div class="bar-slot">
        <div v-if="hasAction(m, 'indoorSowing')" class="bar bar--indoor" />
      </div>
      <div class="bar-slot">
        <div v-if="hasAction(m, 'coldGreenhouse')" class="bar bar--cold" />
      </div>
      <div class="bar-slot">
        <div v-if="hasAction(m, 'outdoor')" class="bar bar--outdoor" />
      </div>
      <div class="bar-slot">
        <div v-if="hasAction(m, 'harvestPeriod')" class="bar bar--bloom" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plant } from 'src/types/plant';
import { getCardPreviewImage } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';
import { isMonthInRange, getCurrentMonth, type CalendarAction } from 'src/composables/useCalendar';

const props = defineProps<{ plant: Plant; showGermination: boolean }>();
defineEmits<{ select: [id: string] }>();

const { localize } = useLocale();
const currentMonth = getCurrentMonth();
const coverUrl = computed(() => getCardPreviewImage(props.plant.images)?.url ?? null);
const displayName = computed(() => localize(props.plant.name));

const plantIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};
const plantIcon = computed(() => plantIconMap[props.plant.type] ?? 'local_florist');

function hasAction(month: number, action: CalendarAction): boolean {
  const range = props.plant.calendar[action];
  if (!range) return false;
  return isMonthInRange(month, range);
}
</script>

<style scoped lang="scss">
.plant-row {
  display: contents;

  &:hover .plant-name,
  &:hover .timeline-cell {
    background: rgba(245, 240, 232, 0.94);
  }

  &:hover .timeline-cell--current {
    background: rgba(92, 107, 78, 0.1);
  }

  &:hover .bar {
    opacity: 1;
  }
}

/* Sticky name column */
.plant-name {
  position: sticky;
  left: 0;
  z-index: 4;
  background: var(--sand);
  padding: 8px 10px 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background 0.15s;

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;
    overflow: hidden;
    background: var(--border-light);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .material-icons-outlined {
      font-size: 16px;
      color: var(--muted);
      opacity: 0.5;
    }
  }

  &__text {
    min-width: 0;
    overflow: hidden;
  }

  &__primary {
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--deep-brown);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  &__latin {
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 400;
    color: var(--muted);
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }
}

/* Germination icon */
.germ-icon {
  .material-icons-outlined {
    font-size: 11px;
    vertical-align: -1px;
    margin-left: 2px;
  }

  &.light .material-icons-outlined {
    color: var(--cal-outdoor);
  }

  &.dark .material-icons-outlined {
    color: var(--cal-indoor);
  }
}

/* Month cell — always 3 fixed slots */
.timeline-cell {
  padding: 4px 2px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  align-items: stretch;
  transition: background 0.15s;

  &--current {
    background: rgba(92, 107, 78, 0.06);
  }
}

/* Fixed-height slot — always takes space even when empty */
.bar-slot {
  height: 5px;
}

/* Colored bars */
.bar {
  height: 5px;
  border-radius: 2.5px;
  opacity: 0.85;
  transition: opacity 0.15s;

  &--indoor  { background: var(--cal-indoor); }
  &--cold    { background: var(--cal-cold); }
  &--outdoor { background: var(--cal-outdoor); }
  &--bloom   { background: var(--cal-bloom); }
}
</style>
