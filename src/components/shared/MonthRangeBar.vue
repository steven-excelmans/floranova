<template>
  <div
    v-if="range"
    class="month-range-bar"
    :class="colorClass"
    :style="barStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MonthRange } from 'src/types/plant';
import type { CalendarAction } from 'src/composables/useCalendar';

const props = defineProps<{
  range: MonthRange;
  action: CalendarAction;
}>();

const actionColorMap: Record<string, string> = {
  indoorSowing: 'bar--indoor',
  greenhouse: 'bar--greenhouse',
  outdoor: 'bar--outdoor',
};

const colorClass = computed(() => actionColorMap[props.action]);

const barStyle = computed(() => {
  if (!props.range) return {};
  const [start, end] = props.range;

  if (start <= end) {
    return {
      gridColumnStart: start,
      gridColumnEnd: end + 1,
    };
  }
  // Wrap-around: show from start to 12 (we don't render the Jan portion for simplicity)
  return {
    gridColumnStart: start,
    gridColumnEnd: 13,
  };
});
</script>

<style scoped lang="scss">
.month-range-bar {
  height: 8px;
  border-radius: 4px;
  min-width: 0;
}

.bar--indoor {
  background-color: #42a5f5;
}

.bar--greenhouse {
  background-color: #ff9800;
}

.bar--outdoor {
  background-color: #66bb6a;
}
</style>
