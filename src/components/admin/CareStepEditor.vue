<template>
  <div class="care-steps">
    <label v-if="label" class="care-steps__label">{{ label }}</label>
    <div class="care-steps__list">
      <div v-for="(step, index) in modelValue" :key="index" class="care-step">
        <div class="care-step__header">
          <span class="care-step__order">Step {{ step.order }}</span>
          <button class="care-step__remove" @click="removeStep(index)">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>

        <BilingualInput
          :model-value="step.action"
          label="Action"
          placeholder="What to do"
          @update:model-value="updateField(index, 'action', $event)"
        />

        <div class="care-step__condition">
          <div class="care-step__row">
            <select
              :value="step.condition.type"
              class="care-step__select"
              @change="updateConditionType(index, ($event.target as HTMLSelectElement).value)"
            >
              <option value="days">Days</option>
              <option value="height">Height</option>
              <option value="leaves">Leaves</option>
              <option value="temperature">Temperature</option>
              <option value="date">Date</option>
              <option value="custom">Custom</option>
            </select>
            <input
              v-if="step.condition.type !== 'custom' && step.condition.type !== 'date'"
              :value="step.condition.value"
              type="number"
              placeholder="Value"
              class="care-step__value"
              @input="updateConditionField(index, 'value', Number(($event.target as HTMLInputElement).value))"
            />
            <input
              v-if="step.condition.unit !== null"
              :value="step.condition.unit"
              placeholder="Unit"
              class="care-step__unit"
              @input="updateConditionField(index, 'unit', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <BilingualInput
            :model-value="step.condition.description"
            label="Description"
            placeholder="When to do it"
            @update:model-value="updateConditionField(index, 'description', $event)"
          />
        </div>
      </div>
    </div>
    <button class="care-steps__add" @click="addStep">
      <span class="material-icons-outlined">add</span>
      Add care step
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CareStep, CareConditionType, BilingualText } from 'src/types/plant';
import BilingualInput from './BilingualInput.vue';

const props = defineProps<{
  modelValue: CareStep[];
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: CareStep[]];
}>();

function updateField(index: number, field: 'action', value: BilingualText) {
  const updated = props.modelValue.map((s, i) =>
    i === index ? { ...s, [field]: value } : s,
  );
  emit('update:modelValue', updated);
}

function updateConditionType(index: number, type: string) {
  const updated = props.modelValue.map((s, i) =>
    i === index
      ? { ...s, condition: { ...s.condition, type: type as CareConditionType } }
      : s,
  );
  emit('update:modelValue', updated);
}

function updateConditionField(index: number, field: string, value: unknown) {
  const updated = props.modelValue.map((s, i) =>
    i === index
      ? { ...s, condition: { ...s.condition, [field]: value } }
      : s,
  );
  emit('update:modelValue', updated);
}

function addStep() {
  const nextOrder = props.modelValue.length > 0
    ? Math.max(...props.modelValue.map((s) => s.order)) + 1
    : 1;

  emit('update:modelValue', [
    ...props.modelValue,
    {
      action: { nl: '', en: '' },
      condition: {
        type: 'days' as CareConditionType,
        value: null,
        unit: 'days',
        description: { nl: '', en: '' },
      },
      order: nextOrder,
    },
  ]);
}

function removeStep(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
}
</script>

<style lang="scss" scoped>
.care-steps {
  &__label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 10px;
  }

  &__add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border: 1.5px dashed var(--border);
    border-radius: var(--radius-sm);
    background: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--muted);
    transition: all 0.2s ease;

    .material-icons-outlined {
      font-size: 16px;
    }

    &:hover {
      border-color: var(--clay-light);
      color: var(--clay);
    }
  }
}

.care-step {
  background: var(--sand);
  border-radius: var(--radius-md);
  padding: 14px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__order {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--clay);
  }

  &__remove {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--muted-light);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    .material-icons-outlined {
      font-size: 16px;
    }

    &:hover {
      color: var(--overdue);
    }
  }

  &__condition {
    margin-top: 10px;
  }

  &__row {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__select,
  &__value,
  &__unit {
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--deep-brown);
    background: var(--warm-white);
    outline: none;

    &:focus {
      border-color: var(--clay-light);
    }
  }

  &__select {
    min-width: 100px;
  }

  &__value {
    width: 80px;
  }

  &__unit {
    width: 80px;
  }
}
</style>
