<template>
  <div
    class="stock-toggle"
    :class="{ active: inStock }"
    role="checkbox"
    :aria-checked="inStock"
    tabindex="0"
    @click="$emit('toggle')"
    @keydown.enter.prevent="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <div class="stock-checkbox">
      <span class="material-icons-outlined">check</span>
    </div>
    <span class="stock-label">{{ t('catalog.inStockOnly') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ inStock: boolean }>();
defineEmits<{ toggle: [] }>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.stock-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  user-select: none;

  &.active {
    .stock-checkbox {
      background: var(--moss);
      border-color: var(--moss);
    }

    .stock-checkbox .material-icons-outlined {
      opacity: 1;
    }

    .stock-label {
      color: var(--moss);
    }
  }
}

.stock-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  flex-shrink: 0;

  .material-icons-outlined {
    font-size: 15px;
    color: var(--warm-white);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

.stock-label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
  transition: color 0.25s ease;
}
</style>
