<template>
  <div
    class="germ-toggle"
    :class="{ active: show }"
    role="checkbox"
    :aria-checked="show"
    tabindex="0"
    @click="$emit('toggle')"
    @keydown.enter.prevent="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <div class="germ-checkbox">
      <span class="material-icons-outlined">check</span>
    </div>
    <span class="germ-label">{{ t('catalog.showGermination') }}</span>
    <span class="germ-preview">
      <span class="material-icons-outlined germ-preview__light">light_mode</span>
      <span class="material-icons-outlined germ-preview__dark">dark_mode</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ show: boolean }>();
defineEmits<{ toggle: [] }>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.germ-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  user-select: none;

  &.active {
    .germ-checkbox {
      background: var(--moss);
      border-color: var(--moss);
    }

    .germ-checkbox .material-icons-outlined {
      opacity: 1;
    }

    .germ-label {
      color: var(--moss);
    }

    .germ-preview {
      opacity: 1;
    }
  }
}

.germ-checkbox {
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

.germ-label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
  transition: color 0.25s ease;
}

.germ-preview {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0.4;
  transition: opacity 0.25s ease;

  &__light {
    font-size: 13px;
    color: var(--cal-outdoor);
  }

  &__dark {
    font-size: 13px;
    color: var(--cal-indoor);
  }
}
</style>
