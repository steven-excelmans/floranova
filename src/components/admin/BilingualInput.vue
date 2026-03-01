<template>
  <div class="bilingual-input">
    <label v-if="label" class="bilingual-input__label">{{ label }}</label>
    <div class="bilingual-input__fields">
      <div class="bilingual-input__field">
        <span class="bilingual-input__lang">NL</span>
        <component
          :is="multiline ? 'textarea' : 'input'"
          :value="modelValue.nl"
          :placeholder="placeholder"
          class="bilingual-input__input"
          :rows="multiline ? 3 : undefined"
          @input="emit('update:modelValue', { ...modelValue, nl: ($event.target as HTMLInputElement).value })"
        />
      </div>
      <div class="bilingual-input__field">
        <span class="bilingual-input__lang">EN</span>
        <component
          :is="multiline ? 'textarea' : 'input'"
          :value="modelValue.en"
          :placeholder="placeholder"
          class="bilingual-input__input"
          :rows="multiline ? 3 : undefined"
          @input="emit('update:modelValue', { ...modelValue, en: ($event.target as HTMLInputElement).value })"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BilingualText } from 'src/types/plant';

defineProps<{
  modelValue: BilingualText;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: BilingualText];
}>();
</script>

<style lang="scss" scoped>
.bilingual-input {
  &__label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__field {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  &__lang {
    font-size: 10px;
    font-weight: 700;
    color: var(--muted-light);
    background: var(--sand);
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    min-width: 28px;
    text-align: center;
    margin-top: 2px;
  }

  &__input {
    flex: 1;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--deep-brown);
    background: var(--warm-white);
    outline: none;
    transition: border-color 0.2s ease;
    resize: vertical;

    &:focus {
      border-color: var(--clay-light);
    }
  }
}
</style>
