<template>
  <div class="color-editor">
    <label v-if="label" class="color-editor__label">{{ label }}</label>
    <div class="color-editor__list">
      <div v-for="(color, index) in modelValue" :key="index" class="color-editor__item">
        <div class="color-editor__swatch" :style="{ background: color.hex }" />
        <input
          :value="color.name"
          placeholder="Color name"
          class="color-editor__name"
          @input="updateName(index, ($event.target as HTMLInputElement).value)"
        />
        <input
          :value="color.hex"
          type="color"
          class="color-editor__picker"
          @input="updateHex(index, ($event.target as HTMLInputElement).value)"
        />
        <button class="color-editor__remove" @click="removeColor(index)">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
    </div>
    <button class="color-editor__add" @click="addColor">
      <span class="material-icons-outlined">add</span>
      Add color
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PlantColor } from 'src/types/plant';

const props = defineProps<{
  modelValue: PlantColor[];
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PlantColor[]];
}>();

function updateName(index: number, name: string) {
  const updated = props.modelValue.map((c, i) => (i === index ? { ...c, name } : c));
  emit('update:modelValue', updated);
}

function updateHex(index: number, hex: string) {
  const updated = props.modelValue.map((c, i) => (i === index ? { ...c, hex } : c));
  emit('update:modelValue', updated);
}

function addColor() {
  emit('update:modelValue', [...props.modelValue, { name: '', hex: '#888888' }]);
}

function removeColor(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
}
</script>

<style lang="scss" scoped>
.color-editor {
  &__label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__swatch {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
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

  &__picker {
    width: 32px;
    height: 32px;
    border: none;
    padding: 0;
    cursor: pointer;
    border-radius: 4px;
    background: none;
  }

  &__remove {
    width: 28px;
    height: 28px;
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
      background: var(--overdue-bg);
    }
  }

  &__add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
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
</style>
