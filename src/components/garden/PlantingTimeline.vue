<template>
  <div class="planting-timeline">
    <div class="timeline-divider"></div>

    <div
      v-for="(event, index) in events"
      :key="event.id"
      class="timeline-step"
      :class="{ 'timeline-step--done': event.completed, 'timeline-step--last': index === events.length - 1 }"
    >
      <!-- Dot -->
      <div class="timeline-dot" :class="dotClass(event)">
        <span class="material-icons-outlined">{{ dotIcon(event) }}</span>
      </div>

      <!-- Body -->
      <div class="timeline-body">
        <div class="timeline-action">{{ localize(event.action) }}</div>

        <div v-if="event.expectedDate" class="timeline-date" :class="{ 'timeline-date--overdue': isOverdue(event) }">
          {{ formatDate(event.expectedDate) }}
          <span v-if="!event.completed && daysUntil(event.expectedDate) !== null">
            <template v-if="daysUntil(event.expectedDate)! < 0">
              ({{ Math.abs(daysUntil(event.expectedDate)!) }} {{ t('garden.daysAgo') }})
            </template>
            <template v-else-if="daysUntil(event.expectedDate)! === 0">
              ({{ t('garden.today') }})
            </template>
            <template v-else>
              ({{ daysUntil(event.expectedDate)! }} {{ t('garden.daysUntil') }})
            </template>
          </span>
        </div>

        <div v-if="!event.completed && !event.dateCalculable && localize(event.condition)" class="timeline-condition">
          {{ localize(event.condition) }}
        </div>

        <!-- Mark done button for condition-based milestones -->
        <button
          v-if="!event.dateCalculable && !event.completed"
          class="timeline-checkbox"
          @click="$emit('complete', event.id)"
        >
          <span class="material-icons-outlined">check_box_outline_blank</span>
          <span class="timeline-checkbox__label">{{ t('garden.markDone') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLocale } from 'src/composables/useLocale';
import type { PlantingTimelineEvent } from 'src/types/planting';

defineProps<{ events: PlantingTimelineEvent[] }>();
defineEmits<{ complete: [milestoneId: string] }>();

const { t } = useI18n();
const { localize } = useLocale();

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(date: Date): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isOverdue(event: PlantingTimelineEvent): boolean {
  if (event.completed || !event.expectedDate) return false;
  const days = daysUntil(event.expectedDate);
  return days !== null && days < 0;
}

function dotClass(event: PlantingTimelineEvent): string {
  if (event.completed) return 'timeline-dot--done';
  if (event.expectedDate) {
    const days = daysUntil(event.expectedDate);
    if (days !== null && days < 0) return 'timeline-dot--overdue';
    if (days !== null && days <= 7) return 'timeline-dot--active';
  }
  // Condition-based and observe states
  if (!event.dateCalculable) return 'timeline-dot--active';
  return 'timeline-dot--pending';
}

function dotIcon(event: PlantingTimelineEvent): string {
  if (event.completed) return 'check';
  if (event.expectedDate) {
    const days = daysUntil(event.expectedDate);
    if (days !== null && days < 0) return 'schedule';
  }
  if (!event.dateCalculable) return 'visibility';
  return 'radio_button_unchecked';
}
</script>

<style lang="scss" scoped>
.planting-timeline {
  padding: 0 18px 18px;
  overflow: hidden;
}

.timeline-divider {
  height: 1px;
  background: var(--sand);
  margin-bottom: 4px;
}

.timeline-step {
  display: flex;
  gap: 14px;
  position: relative;
  padding: 10px 0 0;
  min-height: 48px;

  &::before {
    content: '';
    position: absolute;
    left: 13px;
    top: 36px;
    bottom: -10px;
    width: 2px;
    background: var(--sand);
    border-radius: 1px;
  }

  &.timeline-step--last::before {
    display: none;
  }

  &.timeline-step--done {
    .timeline-action {
      color: var(--muted);
      text-decoration: line-through;
      text-decoration-color: rgba(139, 126, 114, 0.4);
      text-decoration-thickness: 1.5px;
      font-weight: 500;
    }
  }
}

.timeline-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  .material-icons-outlined {
    font-size: 14px;
  }

  &.timeline-dot--done {
    background: var(--moss);
    box-shadow: 0 2px 8px rgba(92, 107, 78, 0.25);

    .material-icons-outlined {
      color: #fff;
    }
  }

  &.timeline-dot--overdue {
    background: var(--warm-white);
    border: 2.5px solid var(--overdue);
    box-shadow: 0 2px 10px rgba(194, 91, 78, 0.2);

    .material-icons-outlined {
      color: var(--overdue);
    }
  }

  &.timeline-dot--active {
    background: var(--soon-bg);
    border: 2.5px solid var(--soon);
    box-shadow: 0 2px 10px rgba(212, 162, 78, 0.2);

    .material-icons-outlined {
      color: var(--soon);
    }
  }

  &.timeline-dot--pending {
    background: var(--warm-white);
    border: 2px solid var(--border);

    .material-icons-outlined {
      color: var(--muted);
      opacity: 0.6;
    }
  }
}

.timeline-body {
  flex: 1;
  min-width: 0;
  padding-top: 3px;
  padding-bottom: 4px;
}

.timeline-action {
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--deep-brown);
  line-height: 1.3;
  margin-bottom: 2px;
}

.timeline-date {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
  line-height: 1.4;

  &.timeline-date--overdue {
    color: var(--overdue);
    font-weight: 500;
  }
}

.timeline-condition {
  font-size: 12px;
  color: var(--clay);
  font-style: italic;
  line-height: 1.4;
  margin-top: 3px;
}

.timeline-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
  padding: 6px 14px 6px 10px;
  background: var(--ok-bg);
  border: 1.5px solid rgba(92, 107, 78, 0.2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  .material-icons-outlined {
    font-size: 18px;
    color: var(--moss);
  }

  &:hover {
    border-color: var(--moss);
    background: rgba(232, 240, 229, 0.8);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(92, 107, 78, 0.12);
  }

  &:active {
    transform: translateY(0);
  }
}

.timeline-checkbox__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--moss);
}
</style>
