<template>
  <div class="timeline-row">
    <div class="timeline-row__name text-caption text-weight-medium text-truncate">
      {{ displayName }}
    </div>
    <div class="timeline-row__bars">
      <MonthRangeBar :range="plant.calendar.indoorSowing" action="indoorSowing" />
      <MonthRangeBar :range="plant.calendar.greenhouse" action="greenhouse" />
      <MonthRangeBar :range="plant.calendar.outdoor" action="outdoor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plant } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';
import MonthRangeBar from 'src/components/shared/MonthRangeBar.vue';

const props = defineProps<{ plant: Plant }>();
const { localize } = useLocale();

const displayName = computed(() => localize(props.plant.name));
</script>

<style scoped lang="scss">
.timeline-row {
  display: contents;

  &__name {
    position: sticky;
    left: 0;
    background: white;
    z-index: 1;
    padding: 6px 8px;
    border-right: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
  }

  &__bars {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-column: span 12;
    align-items: center;
    gap: 2px;
    padding: 4px 0;
  }
}
</style>
