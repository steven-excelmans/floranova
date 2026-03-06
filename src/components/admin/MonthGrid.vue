<template>
  <div class="field" :class="{ 'field--invalid': showError }">
    <span class="field__label">
      {{ label }}
      <span v-if="required" class="field__req">*</span>
      <span v-else class="field__opt">{{ t('admin.optional') }}</span>
    </span>
    <div class="month-grid">
      <div
        v-for="m in 12"
        :key="m"
        class="month-box"
        :class="{ [`month-box--${monthType}`]: isSelected(m) }"
        @click="toggleMonth(m)"
      >
        {{ t(`months.${m}`) }}
      </div>
    </div>
    <span v-if="showError" class="field__error">{{ t('admin.required') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { MonthRange } from 'src/types/plant';

const props = defineProps<{
  modelValue: MonthRange;
  label: string;
  monthType: string;
  required?: boolean;
  optional?: boolean;
  showError?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: MonthRange];
}>();

const { t } = useI18n();

function isSelected(m: number): boolean {
  return props.modelValue?.includes(m) ?? false;
}

function toggleMonth(m: number) {
  const current = props.modelValue ? [...props.modelValue] : [];
  const idx = current.indexOf(m);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(m);
  }

  if (current.length === 0) {
    emit('update:modelValue', null);
  } else {
    emit('update:modelValue', current.sort((a, b) => a - b));
  }
}
</script>

<style lang="scss" scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.field__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.field__req {
  color: var(--overdue);
  font-size: 14px;
  font-weight: 700;
  line-height: 0.7;
}

.field__opt {
  font-size: 10px;
  font-weight: 400;
  color: var(--muted-light);
  font-style: italic;
  text-transform: none;
  letter-spacing: 0;
  margin-left: 2px;
}

.field__error {
  font-size: 11px;
  color: var(--overdue);
  font-weight: 500;
}

.field--invalid .field__label { color: var(--overdue); }

.month-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.month-box {
  padding: 8px 2px;
  border: 1.5px solid var(--border-light);
  border-radius: 6px;
  background: var(--warm-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--muted-light);
  transition: all 0.15s;
  user-select: none;

  &:hover { border-color: var(--clay-light); color: var(--muted); }

  &--indoor {
    background: rgba(125, 161, 184, 0.15);
    border-color: rgba(125, 161, 184, 0.4);
    color: #4A7FA5;
  }

  &--outdoor {
    background: rgba(123, 148, 112, 0.15);
    border-color: rgba(123, 148, 112, 0.4);
    color: var(--moss);
  }

  &--cold {
    background: rgba(160, 165, 160, 0.1);
    border-color: rgba(160, 165, 160, 0.3);
    color: #6B706B;
  }

  &--flowering {
    background: rgba(196, 133, 138, 0.15);
    border-color: rgba(196, 133, 138, 0.4);
    color: var(--flower);
  }
}
</style>
