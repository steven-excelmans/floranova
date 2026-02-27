<template>
  <div v-if="careSteps.length" class="care">
    <h2 class="care__title">{{ t('plant.postGerminationCare') }}</h2>

    <div class="timeline">
      <div
        v-for="(step, index) in sortedSteps"
        :key="step.order"
        class="step"
      >
        <!-- Circular marker with icon -->
        <div class="step__marker">
          <span class="material-icons-outlined">{{ conditionIcon(step.condition.type) }}</span>
        </div>

        <!-- Step number label below the marker -->
        <div class="step__number">STEP {{ index + 1 }}</div>

        <!-- Step content -->
        <div class="step__body">
          <div class="step__action">{{ localize(step.action) }}</div>

          <div class="step__condition">
            <span class="material-icons-outlined">{{ conditionIcon(step.condition.type) }}</span>
            {{ localize(step.condition.description) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CareConditionType, CareStep } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';

const props = defineProps<{ careSteps: CareStep[] }>();

const { t } = useI18n();
const { localize } = useLocale();

const sortedSteps = computed(() =>
  [...props.careSteps].sort((a, b) => a.order - b.order),
);

function conditionIcon(type: CareConditionType): string {
  const icons: Record<CareConditionType, string> = {
    days: 'schedule',
    height: 'straighten',
    leaves: 'eco',
    temperature: 'thermostat',
    date: 'event',
    custom: 'info',
  };
  return icons[type];
}
</script>

<style scoped lang="scss">
.care__title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--deep-brown);
  margin-bottom: 14px;
  letter-spacing: -0.01em;
}

.timeline {
  position: relative;
  padding-left: 40px;

  /* Connecting gradient line */
  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 20px;
    bottom: 20px;
    width: 2px;
    background: linear-gradient(
      180deg,
      var(--moss-pale) 0%,
      var(--border) 50%,
      var(--border-light) 100%
    );
    border-radius: 1px;
  }
}

.step {
  position: relative;
  padding-bottom: 28px;

  &:last-child {
    padding-bottom: 0;
  }

  &:hover .step__marker {
    border-color: var(--moss);
    box-shadow: 0 2px 8px rgba(92, 107, 78, 0.14);
  }
}

.step__marker {
  position: absolute;
  left: -40px;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--warm-white);
  border: 2px solid var(--moss-pale);
  z-index: 2;
  box-shadow: 0 1px 4px rgba(92, 107, 78, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  .material-icons-outlined {
    font-size: 15px;
    color: var(--moss);
  }
}

.step__number {
  position: absolute;
  left: -40px;
  top: 36px;
  width: 32px;
  text-align: center;
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 600;
  color: var(--muted-light);
  letter-spacing: 0.5px;
}

.step__body {
  padding-top: 2px;
}

.step__action {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--deep-brown);
  margin-bottom: 6px;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.step__condition {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-soft);
  background: var(--sand);
  padding: 5px 12px;
  border-radius: var(--radius-sm);

  .material-icons-outlined {
    font-size: 14px;
    color: var(--muted);
  }
}
</style>
