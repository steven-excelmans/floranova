<template>
  <div class="month-grid">
    <div
      v-for="month in 12"
      :key="month"
      class="month-cell"
      :class="isActive(month) ? `month-cell--${actionKey}` : ''"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MonthRange } from 'src/types/plant';
import type { CalendarAction } from 'src/composables/useCalendar';

const props = defineProps<{
  range: MonthRange;
  action: CalendarAction;
}>();

const actionKeyMap: Record<string, string> = {
  indoorSowing: 'indoor',
  greenhouse: 'greenhouse',
  coldGreenhouse: 'cold',
  outdoor: 'outdoor',
};

const actionKey = computed(() => actionKeyMap[props.action] ?? props.action);

function isActive(month: number): boolean {
  if (!props.range) return false;
  const [start, end] = props.range;
  if (start <= end) {
    return month >= start && month <= end;
  }
  // Wrap-around (e.g. Nov–Feb)
  return month >= start || month <= end;
}
</script>

<style scoped lang="scss">
.month-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2px;
  height: 12px;
}

.month-cell {
  border-radius: 3px;
  background: transparent;
  transition: opacity 0.2s;

  &--indoor {
    background: var(--cal-indoor);
  }

  &--greenhouse {
    background: var(--cal-indoor);
  }

  &--cold {
    background: var(--cal-cold);
  }

  &--outdoor {
    background: var(--cal-outdoor);
  }
}
</style>
