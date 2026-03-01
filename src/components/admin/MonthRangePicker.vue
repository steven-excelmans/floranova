<template>
  <div class="month-range">
    <label v-if="label" class="month-range__label">{{ label }}</label>
    <div class="month-range__row">
      <label class="month-range__toggle">
        <input type="checkbox" :checked="enabled" @change="toggleEnabled" />
        <span class="month-range__toggle-text">{{ enabled ? 'Active' : 'Not applicable' }}</span>
      </label>
      <template v-if="enabled">
        <select :value="startMonth" class="month-range__select" @change="updateStart">
          <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
        </select>
        <span class="month-range__separator">to</span>
        <select :value="endMonth" class="month-range__select" @change="updateEnd">
          <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
        </select>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MonthRange } from 'src/types/plant';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const props = defineProps<{
  modelValue: MonthRange;
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: MonthRange];
}>();

const enabled = computed(() => props.modelValue !== null);
const startMonth = computed(() => props.modelValue?.[0] ?? 1);
const endMonth = computed(() => props.modelValue?.[1] ?? 12);

function monthName(m: number) {
  return MONTHS[m - 1] ?? '';
}

function toggleEnabled() {
  emit('update:modelValue', enabled.value ? null : [3, 5]);
}

function updateStart(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value);
  emit('update:modelValue', [val, endMonth.value]);
}

function updateEnd(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value);
  emit('update:modelValue', [startMonth.value, val]);
}
</script>

<style lang="scss" scoped>
.month-range {
  &__label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;

    input {
      accent-color: var(--moss);
    }
  }

  &__toggle-text {
    font-size: 13px;
    color: var(--muted);
  }

  &__select {
    padding: 6px 10px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--deep-brown);
    background: var(--warm-white);
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: var(--clay-light);
    }
  }

  &__separator {
    font-size: 13px;
    color: var(--muted);
  }
}
</style>
