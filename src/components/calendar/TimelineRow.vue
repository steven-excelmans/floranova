<template>
  <!-- display: contents — name cell + 12 month cells live directly in the parent grid -->
  <div class="plant-row">
    <!-- Sticky name column -->
    <div class="plant-name" @click="$emit('select', plant.id)">
      <div class="plant-name__avatar">
        <img
          v-if="plant.images[0]"
          :src="plant.images[0]"
          :alt="displayName"
          loading="lazy"
        />
        <span v-else class="material-icons-outlined">local_florist</span>
      </div>
      <div class="plant-name__text">
        <div class="plant-name__variety">{{ plant.variety ?? displayName }}</div>
        <div class="plant-name__species">{{ plant.species }}</div>
      </div>
    </div>

    <!-- 12 month cells -->
    <div
      v-for="m in 12"
      :key="m"
      class="timeline-cell"
      :class="{ 'timeline-cell--current': m === currentMonth }"
    >
      <div v-if="hasAction(m, 'indoorSowing')" class="bar bar--indoor" />
      <div v-if="hasAction(m, 'coldGreenhouse')" class="bar bar--cold" />
      <div v-if="hasAction(m, 'outdoor')" class="bar bar--outdoor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plant } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';
import { isMonthInRange, getCurrentMonth, type CalendarAction } from 'src/composables/useCalendar';

const props = defineProps<{ plant: Plant }>();
defineEmits<{ select: [id: string] }>();

const { localize } = useLocale();
const currentMonth = getCurrentMonth();

const displayName = computed(() => localize(props.plant.name));

function hasAction(month: number, action: CalendarAction): boolean {
  const range = props.plant.calendar[action];
  if (!range) return false;
  return isMonthInRange(month, range);
}
</script>

<style scoped lang="scss">
/* display: contents — this wrapper is invisible in the layout; children
   participate directly in the parent CSS grid */
.plant-row {
  display: contents;

  /* When any cell in this row is hovered, tint all cells */
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

  &__variety {
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--deep-brown);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  &__species {
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

/* Month cell */
.timeline-cell {
  padding: 6px 2px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
  align-items: stretch;
  transition: background 0.15s;

  &--current {
    background: rgba(92, 107, 78, 0.07);
  }
}

/* Colored bars */
.bar {
  height: 6px;
  border-radius: 3px;
  opacity: 0.85;
  transition: opacity 0.15s;

  &--indoor  { background: var(--cal-indoor); }
  &--cold    { background: var(--cal-cold); }
  &--outdoor { background: var(--cal-outdoor); }
}
</style>
