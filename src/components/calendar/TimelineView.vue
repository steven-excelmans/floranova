<template>
  <div ref="scrollContainer" class="timeline-container">
    <div class="timeline-grid">
      <!-- Header: empty corner + 12 month columns -->
      <div class="timeline-grid__corner" />
      <div
        v-for="m in 12"
        :key="m"
        class="timeline-grid__month-header text-caption text-center text-weight-medium"
        :class="{ 'timeline-grid__month-header--current': m === currentMonth }"
      >
        {{ t(`months.${m}`) }}
      </div>

      <!-- Rows -->
      <template v-for="plant in plants" :key="plant.id">
        <TimelineRow :plant="plant" />
      </template>
    </div>

    <div v-if="plants.length === 0" class="text-center q-pa-xl text-grey-6">
      {{ t('catalog.noResults') }}
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

const { t } = useI18n();
const currentMonth = getCurrentMonth();
const scrollContainer = ref<HTMLElement>();

onMounted(() => {
  // Auto-scroll to current month on mobile
  if (scrollContainer.value && window.innerWidth < 600) {
    const colWidth = scrollContainer.value.scrollWidth / 13;
    scrollContainer.value.scrollLeft = (currentMonth - 2) * colWidth;
  }
});
</script>

<style scoped lang="scss">
.timeline-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.timeline-grid {
  display: grid;
  grid-template-columns: 160px repeat(12, minmax(48px, 1fr));
  min-width: 700px;

  &__corner {
    position: sticky;
    left: 0;
    background: white;
    z-index: 2;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }

  &__month-header {
    padding: 8px 4px;
    border-bottom: 1px solid #e0e0e0;

    &--current {
      background-color: rgba(25, 118, 210, 0.08);
      font-weight: 700;
    }
  }
}
</style>
