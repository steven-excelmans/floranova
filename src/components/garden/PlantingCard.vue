<template>
  <div class="va-card">
    <!-- Header: avatar + info + badge -->
    <div class="va-card-header">
      <div class="va-avatar" :class="plant?.type">
        <q-img
          v-if="coverUrl"
          :src="coverUrl"
          fit="cover"
          class="va-avatar-img"
        >
          <template #error>
            <span class="material-icons-outlined">{{ plantIcon }}</span>
          </template>
        </q-img>
        <span v-else class="material-icons-outlined">{{ plantIcon }}</span>
      </div>

      <div class="va-info">
        <div class="va-name">{{ plant ? localize(plant.name) : planting.plantId }}</div>
        <div class="va-meta">
          <span class="va-meta-item">
            <span class="material-icons-outlined icon-xs">calendar_today</span>
            {{ formatShortDate(planting.dateSeeded) }}
          </span>
          <span class="va-meta-item">
            <span class="material-icons-outlined icon-xs">tag</span>
            {{ planting.amount }}
          </span>
          <span class="va-meta-item">
            <span class="material-icons-outlined icon-xs">{{ locationIcon }}</span>
            {{ t(`garden.${planting.location}`) }}
          </span>
        </div>
      </div>

      <div class="va-badge-area">
        <span class="badge" :class="statusClass">{{ statusLabel }}</span>
      </div>
    </div>

    <!-- Notes (if any) — shown between header and progress like mock -->
    <div v-if="planting.notes" class="va-notes">
      <span class="material-icons-outlined icon-xs">sticky_note_2</span>
      "{{ planting.notes }}"
    </div>

    <!-- Progress bar -->
    <div class="va-progress-section">
      <div class="va-progress-label">
        <span>{{ t('garden.progress') }}</span>
        <span>{{ completedCount }} / {{ totalSteps }} {{ t('garden.steps') }}</span>
      </div>
      <div class="va-progress-track">
        <div
          class="va-progress-fill"
          :class="progressClass"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
    </div>

    <!-- Milestones row -->
    <div v-if="timeline.length > 0" class="va-milestones">
      <span
        v-for="event in timeline"
        :key="event.id"
        class="va-milestone"
        :class="{
          done: event.completed,
          active: !event.completed && event.id === nextAction?.id,
        }"
      >
        {{ localize(event.action) }}
      </span>
    </div>

    <!-- Next action footer -->
    <div v-if="nextAction" class="va-next-action" :class="nextActionColorClass">
      <span class="material-icons-outlined">{{ nextActionIcon }}</span>
      <span>
        <strong>{{ localize(nextAction.action) }}</strong>
        <template v-if="daysUntilNext !== null && daysUntilNext < 0">
          &mdash; {{ Math.abs(daysUntilNext) }} {{ t('garden.daysAgo') }}
        </template>
        <template v-else-if="daysUntilNext === 0">
          &mdash; {{ t('garden.today') }}
        </template>
        <template v-else-if="daysUntilNext !== null">
          &mdash; {{ t('garden.in') }} {{ daysUntilNext }}d
        </template>
        <template v-else-if="!nextAction.expectedDate">
          &mdash; {{ t('garden.conditionBased') }}
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocale } from 'src/composables/useLocale';
import { usePlantStore } from 'src/stores/plant-store';
import type { Planting } from 'src/types/planting';
import { getCoverImage } from 'src/types/plant';
import { buildPlantingTimeline, getNextAction } from 'src/composables/usePlantingTimeline';

const props = defineProps<{ planting: Planting }>();
defineEmits<{
  delete: [id: string];
  complete: [plantingId: string, milestoneId: string];
}>();

const { t } = useI18n();
const { localize } = useLocale();
const plantStore = usePlantStore();

const plant = computed(() => plantStore.getPlantById(props.planting.plantId));
const coverUrl = computed(() => plant.value ? getCoverImage(plant.value.images)?.url ?? null : null);

const plantIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};
const plantIcon = computed(() => plantIconMap[plant.value?.type ?? 'flower'] ?? 'local_florist');

const timeline = computed(() =>
  plant.value ? buildPlantingTimeline(props.planting, plant.value) : [],
);
const nextAction = computed(() => getNextAction(timeline.value));

const totalSteps = computed(() => timeline.value.length);
const completedCount = computed(() => timeline.value.filter((e) => e.completed).length);
const progressPercent = computed(() =>
  totalSteps.value > 0 ? Math.round((completedCount.value / totalSteps.value) * 100) : 0,
);

const daysUntilNext = computed(() => {
  if (!nextAction.value?.expectedDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(nextAction.value.expectedDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

// Urgency state
type Urgency = 'overdue' | 'soon' | 'ok';
const urgency = computed<Urgency>(() => {
  if (!nextAction.value) return 'ok';
  if (!nextAction.value.expectedDate) return 'ok';
  const d = daysUntilNext.value;
  if (d === null) return 'ok';
  if (d < 0) return 'overdue';
  if (d <= 7) return 'soon';
  return 'ok';
});

const statusClass = computed(() => `badge--${urgency.value}`);
const statusLabel = computed(() => {
  if (urgency.value === 'overdue') return t('garden.overdue');
  if (urgency.value === 'soon') return t('garden.dueSoon');
  return t('garden.onTrack');
});

const progressClass = computed(() => urgency.value);

const nextActionColorClass = computed(() => urgency.value);
const nextActionIcon = computed(() => {
  if (urgency.value === 'overdue') return 'warning';
  if (urgency.value === 'soon') return 'schedule';
  if (!nextAction.value?.expectedDate) return 'visibility';
  return 'check_circle';
});

const locationIcon = computed(() => {
  switch (props.planting.location) {
    case 'indoor': return 'home';
    case 'cold-greenhouse': return 'warehouse';
    case 'outdoor': return 'park';
    default: return 'home';
  }
});

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
</script>

<style lang="scss" scoped>
.va-card {
  background: var(--warm-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  margin-bottom: 14px;
  overflow: hidden;
}

/* Header */
.va-card-header {
  display: flex;
  align-items: flex-start;
  padding: 16px 16px 0;
  gap: 12px;
}

.va-avatar {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  &.flower { background: var(--flower-bg); color: var(--flower); }
  &.herb { background: var(--herb-bg); color: var(--herb); }
  &.vegetable { background: var(--veg-bg); color: var(--veg); }

  .material-icons-outlined {
    font-size: 24px;
  }
}

.va-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
}

.va-info {
  flex: 1;
  min-width: 0;
}

.va-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--deep-brown);
  margin-bottom: 4px;
}

.va-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  flex-wrap: wrap;
}

.va-meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.icon-xs {
  font-size: 14px !important;
}

.va-badge-area {
  flex-shrink: 0;
}

/* Badge — shared style */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;

  &--overdue { background: var(--overdue-bg); color: var(--overdue); }
  &--soon { background: var(--soon-bg); color: var(--soon); }
  &--ok { background: var(--ok-bg); color: var(--ok); }
}

/* Notes — between header and progress */
.va-notes {
  padding: 0 16px 10px;
  font-size: 12px;
  color: var(--muted);
  font-style: italic;

  .material-icons-outlined {
    vertical-align: middle;
    margin-right: 2px;
  }
}

/* Progress section */
.va-progress-section {
  padding: 12px 16px 14px;
}

.va-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 6px;
}

.va-progress-track {
  height: 6px;
  background: var(--sand);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.va-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;

  &.overdue { background: var(--overdue); }
  &.soon { background: var(--soon); }
  &.ok { background: var(--moss); }
}

/* Milestones row */
.va-milestones {
  display: flex;
  justify-content: space-between;
  padding: 0 16px 6px;
  margin-top: -2px;
}

.va-milestone {
  font-size: 10px;
  color: var(--muted-light);
  text-align: center;

  &.active {
    color: var(--deep-brown);
    font-weight: 600;
  }

  &.done {
    color: var(--moss);
  }
}

/* Next action footer */
.va-next-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--border-light);
  font-size: 12px;

  .material-icons-outlined {
    font-size: 16px;
  }

  &.overdue {
    color: var(--overdue);
    background: var(--overdue-bg);
  }

  &.soon {
    color: var(--soon);
    background: var(--soon-bg);
  }

  &.ok {
    color: var(--ok);
    background: var(--ok-bg);
  }
}
</style>
