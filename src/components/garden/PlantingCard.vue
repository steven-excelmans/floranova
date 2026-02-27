<template>
  <div class="planting-card">
    <!-- Card Header (clickable to expand/collapse) -->
    <div class="planting-card__header" @click="expanded = !expanded">
      <!-- Avatar -->
      <div class="planting-card__avatar">
        <q-img
          v-if="plant && plant.images[0]"
          :src="plant.images[0]"
          fit="cover"
          class="planting-card__avatar-img"
        >
          <template #error>
            <span class="material-icons-outlined">local_florist</span>
          </template>
        </q-img>
        <span v-else class="material-icons-outlined">local_florist</span>
      </div>

      <!-- Info -->
      <div class="planting-card__info">
        <div class="planting-card__name">
          {{ plant ? localize(plant.name) : planting.plantId }}
        </div>
        <div class="planting-card__meta">
          <span class="planting-card__meta-item">
            <span class="material-icons-outlined">event</span>
            {{ formatShortDate(planting.dateSeeded) }}
          </span>
          <span class="planting-card__meta-item">
            <span class="material-icons-outlined">tag</span>
            {{ planting.amount }}
          </span>
          <span class="planting-card__meta-item">
            <span class="material-icons-outlined">{{ locationIcon }}</span>
            {{ t(`garden.${planting.location}`) }}
          </span>
        </div>
        <div v-if="planting.notes" class="planting-card__notes">{{ planting.notes }}</div>
      </div>

      <!-- Status badge -->
      <div v-if="nextAction" class="status-badge" :class="statusBadgeClass">
        <span class="material-icons-outlined">{{ statusIcon }}</span>
        {{ statusLabel }}
      </div>
    </div>

    <!-- Timeline (slide transition) -->
    <q-slide-transition>
      <div v-if="expanded">
        <PlantingTimeline
          :events="timeline"
          @complete="$emit('complete', planting.id, $event)"
        />
      </div>
    </q-slide-transition>

    <!-- Toggle footer -->
    <div
      class="planting-card__toggle"
      :class="{ 'planting-card__toggle--expanded': expanded }"
      @click="expanded = !expanded"
    >
      <span class="material-icons-outlined">expand_more</span>
      <button
        class="planting-card__delete"
        @click.stop="confirmDelete"
        :aria-label="t('garden.delete')"
      >
        <span class="material-icons-outlined">delete_outline</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useLocale } from 'src/composables/useLocale';
import { usePlantStore } from 'src/stores/plant-store';
import type { Planting } from 'src/types/planting';
import { buildPlantingTimeline, getNextAction } from 'src/composables/usePlantingTimeline';
import PlantingTimeline from './PlantingTimeline.vue';

const props = defineProps<{ planting: Planting }>();
const emit = defineEmits<{
  delete: [id: string];
  complete: [plantingId: string, milestoneId: string];
}>();

const { t } = useI18n();
const $q = useQuasar();
const { localize } = useLocale();
const plantStore = usePlantStore();

const expanded = ref(false);

const plant = computed(() => plantStore.getPlantById(props.planting.plantId));

const timeline = computed(() =>
  plant.value ? buildPlantingTimeline(props.planting, plant.value) : [],
);

const nextAction = computed(() => getNextAction(timeline.value));

const daysUntilNextAction = computed(() => {
  if (!nextAction.value?.expectedDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(nextAction.value.expectedDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

const statusBadgeClass = computed(() => {
  if (!nextAction.value) return '';
  // Condition-based (no expected date) = observe
  if (!nextAction.value.expectedDate) return 'status-badge--observe';
  const diff = daysUntilNextAction.value;
  if (diff === null) return 'status-badge--observe';
  if (diff < 0) return 'status-badge--overdue';
  if (diff <= 7) return 'status-badge--soon';
  return 'status-badge--observe';
});

const statusIcon = computed(() => {
  const cls = statusBadgeClass.value;
  if (cls === 'status-badge--overdue') return 'warning_amber';
  if (cls === 'status-badge--soon') return 'schedule';
  return 'visibility';
});

const statusLabel = computed(() => {
  if (!nextAction.value) return '';
  const diff = daysUntilNextAction.value;
  if (diff === null) return t('garden.conditionBased');
  if (diff < 0) return `${Math.abs(diff)}d ${t('garden.daysAgo')}`;
  if (diff === 0) return t('garden.today');
  if (diff <= 7) return `${t('garden.in')} ${diff}d`;
  return t('garden.conditionBased');
});

const locationIcon = computed(() => {
  switch (props.planting.location) {
    case 'indoor': return 'home';
    case 'greenhouse': return 'filter_drama';
    case 'cold-greenhouse': return 'ac_unit';
    case 'outdoor': return 'park';
    default: return 'home';
  }
});

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function confirmDelete() {
  $q.dialog({
    title: t('garden.delete'),
    message: t('garden.deleteConfirm'),
    cancel: true,
  }).onOk(() => {
    emit('delete', props.planting.id);
  });
}
</script>

<style lang="scss" scoped>
.planting-card {
  background: var(--warm-white);
  border-radius: var(--radius-card);
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 2px 12px rgba(53, 43, 34, 0.06);
  transition: box-shadow 0.3s ease;
  animation: fadeInCard 0.4s ease both;

  &:hover {
    box-shadow: 0 4px 20px rgba(53, 43, 34, 0.1);
  }

  &:nth-child(2) { animation-delay: 0.06s; }
  &:nth-child(3) { animation-delay: 0.12s; }
  &:nth-child(4) { animation-delay: 0.18s; }
}

.planting-card__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  cursor: pointer;
}

.planting-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--sand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 14px;
    border: 1px solid rgba(92, 107, 78, 0.08);
  }

  .material-icons-outlined {
    font-size: 24px;
    color: var(--moss);
    opacity: 0.6;
  }
}

.planting-card__avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 14px;
}

.planting-card__info {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.planting-card__name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--deep-brown);
  margin-bottom: 4px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.planting-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.planting-card__meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;

  .material-icons-outlined {
    font-size: 14px;
    opacity: 0.7;
  }
}

.planting-card__notes {
  font-size: 11.5px;
  color: var(--muted-light);
  font-style: italic;
  margin-top: 4px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;

  .material-icons-outlined {
    font-size: 14px;
  }

  &.status-badge--overdue {
    background: var(--overdue-bg);
    color: var(--overdue);
  }

  &.status-badge--soon {
    background: var(--soon-bg);
    color: var(--soon);
  }

  &.status-badge--observe {
    background: var(--ok-bg);
    color: var(--ok);
  }
}

/* Toggle footer */
.planting-card__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  cursor: pointer;
  color: var(--muted);
  transition: color 0.2s, background 0.2s;
  border-top: 1px solid var(--sand);
  position: relative;

  &:hover {
    color: var(--moss);
    background: rgba(92, 107, 78, 0.03);
  }

  .material-icons-outlined {
    font-size: 20px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.planting-card__toggle--expanded {
    .material-icons-outlined:first-child {
      transform: rotate(180deg);
    }
  }
}

.planting-card__delete {
  position: absolute;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--muted-light);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  .material-icons-outlined {
    font-size: 18px;
    transition: none;
  }

  &:hover {
    background: var(--overdue-bg);
    color: var(--overdue);
  }
}

@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
