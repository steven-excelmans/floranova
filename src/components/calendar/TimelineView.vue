<template>
  <div class="timeline-view">
    <!-- Legend -->
    <div class="timeline-legend">
      <div class="legend-item">
        <div class="legend-dot legend-dot--indoor" />
        {{ t('calendar.indoorSowing') }}
      </div>
      <div class="legend-item">
        <div class="legend-dot legend-dot--cold" />
        {{ t('calendar.coldGreenhouse') }}
      </div>
      <div class="legend-item">
        <div class="legend-dot legend-dot--outdoor" />
        {{ t('calendar.outdoor') }}
      </div>
    </div>

    <!-- Horizontally scrollable grid -->
    <div ref="scrollContainer" class="timeline-scroll">
      <div class="timeline-grid">
        <!-- Month header row -->
        <div class="timeline-corner" />
        <div
          v-for="m in 12"
          :key="m"
          class="timeline-month"
          :class="{ 'timeline-month--current': m === currentMonth }"
        >
          {{ t(`months.${m}`) }}
        </div>

        <!-- Separator below months -->
        <div class="timeline-separator" />

        <!-- Plant rows — each uses display:contents -->
        <TimelineRow
          v-for="plant in plants"
          :key="plant.id"
          :plant="plant"
          @select="$emit('select', $event)"
        />
      </div>

      <!-- Empty state -->
      <div v-if="plants.length === 0" class="timeline-empty">
        <span class="material-icons-outlined">grass</span>
        <div class="timeline-empty__text">{{ t('catalog.noResults') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Plant } from 'src/types/plant';
import { getCurrentMonth } from 'src/composables/useCalendar';
import TimelineRow from './TimelineRow.vue';

defineProps<{ plants: Plant[] }>();
defineEmits<{ select: [id: string] }>();

const { t } = useI18n();
const currentMonth = getCurrentMonth();
const scrollContainer = ref<HTMLElement>();

onMounted(() => {
  if (scrollContainer.value) {
    // Column 0 = name (148px), each month col ~40px
    // Scroll so that current month is roughly centered
    const targetScroll = 148 + (currentMonth - 2) * 40 - 60;
    scrollContainer.value.scrollLeft = Math.max(0, targetScroll);
  }
});
</script>

<style scoped lang="scss">
.timeline-view {
  display: block;
}

/* Legend */
.timeline-legend {
  display: flex;
  gap: 16px;
  padding: 14px 20px 6px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.1px;
}

.legend-dot {
  width: 10px;
  height: 6px;
  border-radius: 3px;
  flex-shrink: 0;

  &--indoor  { background: var(--cal-indoor); }
  &--cold    { background: var(--cal-cold); }
  &--outdoor { background: var(--cal-outdoor); }
}

/* Scroll container */
.timeline-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0 20px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* Grid */
.timeline-grid {
  display: grid;
  grid-template-columns: 148px repeat(12, minmax(40px, 1fr));
  min-width: 648px;
  padding: 0 8px 0 0;
}

/* Sticky corner cell (top-left) */
.timeline-corner {
  position: sticky;
  left: 0;
  z-index: 5;
  background: var(--sand);
  padding: 10px 0 8px;
}

/* Month header cells */
.timeline-month {
  text-align: center;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  padding: 10px 0 8px;
  letter-spacing: 0.3px;
  position: relative;

  &--current {
    color: var(--moss);
    font-weight: 700;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--moss);
    }
  }
}

/* Full-width separator below month headers */
.timeline-separator {
  grid-column: 1 / -1;
  height: 1px;
  background: var(--border-light);
}

/* Empty state */
.timeline-empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--muted);

  .material-icons-outlined {
    font-size: 40px;
    color: var(--border);
    display: block;
    margin-bottom: 8px;
  }

  &__text {
    font-family: var(--font-body);
    font-size: 13.5px;
    color: var(--muted);
  }
}
</style>
