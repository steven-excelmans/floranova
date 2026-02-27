<template>
  <div class="upcoming-view">
    <!-- Empty state -->
    <div v-if="upcomingEvents.length === 0" class="empty-state">
      <div class="empty-state__icon-wrap">
        <span class="material-icons-outlined">event_available</span>
      </div>
      <div class="empty-state__title">{{ t('garden.noUpcoming') }}</div>
    </div>

    <!-- Groups -->
    <div
      v-for="group in groupedEvents"
      :key="group.key"
      class="upcoming-group"
    >
      <div class="upcoming-group__header">
        <span class="upcoming-group__label">{{ group.label }}</span>
        <span class="upcoming-group__count">{{ group.events.length }}</span>
      </div>

      <div
        v-for="event in group.events"
        :key="event.eventId"
        class="upcoming-card"
      >
        <!-- Plant avatar -->
        <div class="upcoming-card__avatar">
          <q-img
            v-if="event.plant?.images[0]"
            :src="event.plant.images[0]"
            fit="cover"
            class="upcoming-card__avatar-img"
          >
            <template #error>
              <span class="material-icons-outlined">local_florist</span>
            </template>
          </q-img>
          <span v-else class="material-icons-outlined">local_florist</span>
        </div>

        <!-- Info -->
        <div class="upcoming-card__info">
          <div class="upcoming-card__action-name">{{ localize(event.action) }}</div>
          <div class="upcoming-card__plant-name">{{ event.plant ? localize(event.plant.name) : '' }}</div>
          <div v-if="localize(event.condition)" class="upcoming-card__condition">
            {{ localize(event.condition) }}
          </div>
        </div>

        <!-- Time badge -->
        <div class="time-badge" :class="timeBadgeClass(event)">
          {{ timeBadgeLabel(event) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocale } from 'src/composables/useLocale';
import { usePlantStore } from 'src/stores/plant-store';
import { usePlantingStore } from 'src/stores/planting-store';
import { buildPlantingTimeline } from 'src/composables/usePlantingTimeline';
import type { BilingualText, Plant } from 'src/types/plant';

const { t } = useI18n();
const { localize } = useLocale();
const plantStore = usePlantStore();
const plantingStore = usePlantingStore();

interface UpcomingEvent {
  eventId: string;
  action: BilingualText;
  condition: BilingualText;
  expectedDate: Date | null;
  daysUntil: number;
  plant: Plant | undefined;
}

const upcomingEvents = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const events: UpcomingEvent[] = [];

  for (const planting of plantingStore.activePlantings) {
    const plant = plantStore.getPlantById(planting.plantId);
    if (!plant) continue;

    const timeline = buildPlantingTimeline(planting, plant);
    for (const event of timeline) {
      if (event.completed) continue;
      const target = event.expectedDate ? new Date(event.expectedDate) : null;
      if (target) target.setHours(0, 0, 0, 0);
      const diff = target
        ? Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 500; // condition-based: medium priority
      events.push({
        eventId: `${planting.id}-${event.id}`,
        action: event.action,
        condition: event.condition,
        expectedDate: event.expectedDate,
        daysUntil: diff,
        plant,
      });
    }
  }

  return events.sort((a, b) => a.daysUntil - b.daysUntil);
});

interface EventGroup {
  key: string;
  label: string;
  events: UpcomingEvent[];
}

const groupedEvents = computed<EventGroup[]>(() => {
  const overdue: UpcomingEvent[] = [];
  const thisWeek: UpcomingEvent[] = [];
  const nextWeek: UpcomingEvent[] = [];
  const later: UpcomingEvent[] = [];

  for (const event of upcomingEvents.value) {
    if (event.daysUntil < 0) {
      overdue.push(event);
    } else if (event.daysUntil <= 7) {
      thisWeek.push(event);
    } else if (event.daysUntil <= 14) {
      nextWeek.push(event);
    } else {
      later.push(event);
    }
  }

  const groups: EventGroup[] = [];
  if (overdue.length) groups.push({ key: 'overdue', label: t('garden.overdue'), events: overdue });
  if (thisWeek.length) groups.push({ key: 'thisWeek', label: t('garden.thisWeek'), events: thisWeek });
  if (nextWeek.length) groups.push({ key: 'nextWeek', label: t('garden.nextWeek'), events: nextWeek });
  if (later.length) groups.push({ key: 'later', label: t('garden.later'), events: later });
  return groups;
});

function timeBadgeClass(event: UpcomingEvent): string {
  if (event.daysUntil < 0) return 'time-badge--overdue';
  if (!event.expectedDate) return 'time-badge--observe';
  if (event.daysUntil <= 7) return 'time-badge--soon';
  if (event.daysUntil <= 14) return 'time-badge--soon';
  return 'time-badge--later';
}

function timeBadgeLabel(event: UpcomingEvent): string {
  if (event.daysUntil < 0) return `${Math.abs(event.daysUntil)}d ${t('garden.daysAgo')}`;
  if (event.daysUntil === 0) return t('garden.today');
  if (!event.expectedDate) return t('garden.conditionBased');
  if (event.daysUntil <= 500) return `${event.daysUntil}d`;
  return t('garden.conditionBased');
}
</script>

<style lang="scss" scoped>
.upcoming-view {
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

.upcoming-group {
  margin-bottom: 22px;
  animation: fadeInGroup 0.4s ease both;

  &:nth-child(2) { animation-delay: 0.06s; }
  &:nth-child(3) { animation-delay: 0.12s; }
  &:nth-child(4) { animation-delay: 0.18s; }
}

.upcoming-group__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  margin-bottom: 10px;
}

.upcoming-group__label {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--deep-brown);
}

.upcoming-group__count {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  background: var(--sand);
  padding: 2px 9px;
  border-radius: var(--radius-sm);
}

.upcoming-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--warm-white);
  border-radius: 16px;
  margin-bottom: 8px;
  transition: box-shadow 0.2s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 16px rgba(53, 43, 34, 0.08);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.upcoming-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--sand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  .material-icons-outlined {
    font-size: 20px;
    color: var(--moss);
    opacity: 0.5;
  }
}

.upcoming-card__avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

.upcoming-card__info {
  flex: 1;
  min-width: 0;
}

.upcoming-card__action-name {
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--deep-brown);
  line-height: 1.3;
}

.upcoming-card__plant-name {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
  margin-top: 1px;
}

.upcoming-card__condition {
  font-size: 11.5px;
  color: var(--clay);
  font-style: italic;
  margin-top: 2px;
  line-height: 1.3;
}

.time-badge {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 11px;
  border-radius: var(--radius-pill);
  white-space: nowrap;

  &.time-badge--overdue {
    background: var(--overdue-bg);
    color: var(--overdue);
  }

  &.time-badge--soon {
    background: var(--soon-bg);
    color: var(--soon);
  }

  &.time-badge--observe {
    background: var(--ok-bg);
    color: var(--ok);
  }

  &.time-badge--later {
    background: var(--sand);
    color: var(--muted);
  }
}

@keyframes fadeInGroup {
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
