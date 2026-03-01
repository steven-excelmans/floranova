<template>
  <div class="validation-panel">
    <div class="validation-panel__header" :class="{ 'validation-panel__header--error': !result.valid }">
      <span class="material-icons-outlined validation-panel__icon">
        {{ result.valid ? 'check_circle' : 'error' }}
      </span>
      <div class="validation-panel__info">
        <span class="validation-panel__name">
          {{ result.plant.species }}
          <span v-if="result.plant.variety" class="validation-panel__variety">'{{ result.plant.variety }}'</span>
        </span>
        <span class="validation-panel__id">{{ result.plant.id }}</span>
      </div>
    </div>

    <!-- Name corrections -->
    <div v-if="result.hasNameCorrections && result.nameCorrections" class="correction-box">
      <div class="correction-box__title">
        <span class="material-icons-outlined">swap_horiz</span>
        Name Correction
      </div>
      <div class="correction-box__detail">
        <span class="correction-box__old">{{ result.nameCorrections.originalSpecies }} {{ result.nameCorrections.originalVariety }}</span>
        <span class="material-icons-outlined correction-box__arrow">arrow_forward</span>
        <span class="correction-box__new">{{ result.nameCorrections.correctedSpecies }} {{ result.nameCorrections.correctedVariety }}</span>
      </div>
    </div>

    <!-- Errors -->
    <div v-if="result.errors.length" class="message-list message-list--error">
      <div v-for="(err, i) in result.errors" :key="i" class="message-item">
        <span class="material-icons-outlined">close</span>
        {{ err }}
      </div>
    </div>

    <!-- Warnings -->
    <div v-if="result.warnings.length" class="message-list message-list--warning">
      <div v-for="(warn, i) in result.warnings" :key="i" class="message-item">
        <span class="material-icons-outlined">warning</span>
        {{ warn }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationResult } from 'src/composables/usePlantValidator';

defineProps<{
  result: ValidationResult;
}>();
</script>

<style lang="scss" scoped>
.validation-panel {
  background: var(--warm-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-left: 3px solid var(--moss);

    &--error {
      border-left-color: var(--overdue);
    }
  }

  &__icon {
    font-size: 20px;
    color: var(--moss);

    .validation-panel__header--error & {
      color: var(--overdue);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--deep-brown);
  }

  &__variety {
    font-style: italic;
    font-weight: 400;
    color: var(--muted);
  }

  &__id {
    font-size: 11px;
    font-family: monospace;
    color: var(--muted-light);
  }
}

.correction-box {
  margin: 0 16px 12px;
  padding: 10px 14px;
  background: var(--soon-bg);
  border-radius: var(--radius-sm);

  &__title {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--soon);
    margin-bottom: 6px;

    .material-icons-outlined {
      font-size: 14px;
    }
  }

  &__detail {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__old {
    font-size: 13px;
    color: var(--muted);
    text-decoration: line-through;
  }

  &__arrow {
    font-size: 16px;
    color: var(--soon);
  }

  &__new {
    font-size: 13px;
    font-weight: 600;
    color: var(--deep-brown);
  }
}

.message-list {
  padding: 0 16px 12px;

  &--error .message-item {
    color: var(--overdue);
  }

  &--warning .message-item {
    color: var(--soon);
  }
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 12px;
  padding: 3px 0;

  .material-icons-outlined {
    font-size: 14px;
    margin-top: 1px;
  }
}
</style>
