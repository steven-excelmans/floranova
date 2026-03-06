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
      <!-- Section divider: dot + label + line -->
      <div class="section-divider">
        <span class="dot" :class="`dot--${group.key}`" />
        <span class="label">{{ group.label }}</span>
        <span class="line" />
      </div>

      <!-- Action cards -->
      <div
        v-for="event in group.events"
        :key="event.eventId"
        class="action-card"
      >
        <!-- Plant avatar -->
        <div class="plant-avatar" :class="event.plant?.type">
          <q-img
            v-if="event.plant && getCoverImage(event.plant.images)"
            :src="getCoverImage(event.plant.images)!.url"
            fit="cover"
            class="plant-avatar__img"
          >
            <template #error>
              <span class="material-icons-outlined">{{ getPlantIcon(event.plant?.type) }}</span>
            </template>
          </q-img>
          <span v-else class="material-icons-outlined">{{ getPlantIcon(event.plant?.type) }}</span>
        </div>

        <!-- Info -->
        <div class="action-info">
          <div class="action-name">{{ localize(event.action) }}</div>
          <div class="plant-name">{{ event.plant ? localize(event.plant.name) : '' }}</div>
          <div v-if="localize(event.condition)" class="condition">
            {{ localize(event.condition) }}
          </div>
        </div>

        <!-- Time badge -->
        <span class="badge" :class="badgeClass(event)">
          {{ badgeLabel(event) }}
        </span>

        <!-- Check button -->
        <button
          class="check-btn"
          :title="t('garden.markDone')"
          @click.stop="completeEvent(event)"
        >
          <span class="material-icons-outlined">check</span>
        </button>
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
import { getCoverImage } from 'src/types/plant';

const { t } = useI18n();
const { localize } = useLocale();
const plantStore = usePlantStore();
const plantingStore = usePlantingStore();

interface UpcomingEvent {
  eventId: string;
  plantingId: string;
  milestoneId: string;
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
        : 500;
      events.push({
        eventId: `${planting.id}-${event.id}`,
        plantingId: planting.id,
        milestoneId: event.id,
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

const plantIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};

function getPlantIcon(type?: string): string {
  return plantIconMap[type ?? 'flower'] ?? 'local_florist';
}

function badgeClass(event: UpcomingEvent): string {
  if (event.daysUntil < 0) return 'badge--overdue';
  if (event.daysUntil === 0) return 'badge--today';
  if (!event.expectedDate) return 'badge--observe';
  if (event.daysUntil <= 7) return 'badge--soon';
  if (event.daysUntil <= 14) return 'badge--later';
  return 'badge--later';
}

function badgeLabel(event: UpcomingEvent): string {
  if (event.daysUntil < 0) return `${Math.abs(event.daysUntil)}d ${t('garden.daysAgo')}`;
  if (event.daysUntil === 0) return t('garden.today');
  if (!event.expectedDate) return t('garden.conditionBased');
  return `${t('garden.in')} ${event.daysUntil}d`;
}

function completeEvent(event: UpcomingEvent) {
  void plantingStore.completeMilestone(event.plantingId, event.milestoneId);
}
</script>

<style lang="scss" scoped>
.upcoming-view {
  padding: 0;
}

/* Empty state */
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

/* Section divider: dot + label + line */
.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &--overdue { background: var(--overdue); }
  &--thisWeek { background: var(--soon); }
  &--nextWeek { background: var(--moss); }
  &--later { background: var(--muted-light); }
}

.label {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  white-space: nowrap;
}

.line {
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

/* Action card */
.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--warm-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

/* Plant avatar */
.plant-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  font-size: 20px;

  &.flower { background: var(--flower-bg); color: var(--flower); }
  &.herb { background: var(--herb-bg); color: var(--herb); }
  &.vegetable { background: var(--veg-bg); color: var(--veg); }

  .material-icons-outlined {
    font-size: 20px;
  }
}

.plant-avatar__img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
}

/* Action info */
.action-info {
  flex: 1;
  min-width: 0;
}

.action-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--deep-brown);
}

.plant-name {
  font-size: 13px;
  color: var(--muted);
  margin-top: 1px;
}

.condition {
  font-size: 11px;
  color: var(--muted-light);
  margin-top: 4px;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
  white-space: nowrap;

  &--overdue { background: var(--overdue-bg); color: var(--overdue); }
  &--today { background: var(--soon-bg); color: var(--soon); }
  &--soon { background: var(--ok-bg); color: var(--ok); }
  &--observe { background: var(--moss-pale); color: var(--moss); }
  &--later { background: var(--sand); color: var(--muted); }
}

/* Check button */
.check-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  color: transparent;

  &:hover {
    border-color: var(--moss);
    background: var(--moss-pale);
    color: var(--moss);
  }

  &:active {
    transform: scale(0.92);
  }

  .material-icons-outlined {
    font-size: 18px;
  }
}
</style>
