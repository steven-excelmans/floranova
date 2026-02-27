<template>
  <div class="planting-list">
    <!-- Empty state -->
    <div v-if="sortedPlantings.length === 0" class="empty-state">
      <div class="empty-state__icon-wrap">
        <span class="material-icons-outlined">yard</span>
      </div>
      <div class="empty-state__title">{{ t('garden.noPlantingsTitle') }}</div>
      <div class="empty-state__desc">{{ t('garden.noPlantingsDesc') }}</div>
    </div>

    <!-- Planting cards -->
    <PlantingCard
      v-for="planting in sortedPlantings"
      :key="planting.id"
      :planting="planting"
      @delete="$emit('delete', $event)"
      @complete="(pId, mId) => $emit('complete', pId, mId)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Planting } from 'src/types/planting';
import { usePlantStore } from 'src/stores/plant-store';
import { buildPlantingTimeline, getNextAction } from 'src/composables/usePlantingTimeline';
import PlantingCard from './PlantingCard.vue';

const props = defineProps<{ plantings: Planting[] }>();
defineEmits<{
  delete: [id: string];
  complete: [plantingId: string, milestoneId: string];
}>();

const { t } = useI18n();
const plantStore = usePlantStore();

function getNextActionDays(planting: Planting): number {
  const plant = plantStore.getPlantById(planting.plantId);
  if (!plant) return 999;
  const timeline = buildPlantingTimeline(planting, plant);
  const next = getNextAction(timeline);
  if (!next) return 998; // all done
  if (!next.expectedDate) return 500; // condition-based, middle priority
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(next.expectedDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Sort by most urgent first (overdue first, then soonest)
const sortedPlantings = computed(() =>
  [...props.plantings].sort((a, b) => getNextActionDays(a) - getNextActionDays(b)),
);
</script>

<style lang="scss" scoped>
.planting-list {
  padding: 0;
}

.empty-state {
  background: var(--warm-white);
  border-radius: var(--radius-card);
  border: 1.5px dashed var(--border);
  padding: 40px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--moss-ghost);
  display: flex;
  align-items: center;
  justify-content: center;

  .material-icons-outlined {
    font-size: 28px;
    color: var(--moss);
    opacity: 0.7;
  }
}

.empty-state__title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--deep-brown);
}

.empty-state__desc {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  max-width: 260px;
}
</style>
