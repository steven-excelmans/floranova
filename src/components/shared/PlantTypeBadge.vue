<template>
  <span class="plant-type-badge" :class="type">{{ t(`catalog.${type}`) }}</span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PlantType } from 'src/types/plant';

defineProps<{ type: PlantType }>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.plant-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  width: fit-content;

  &.flower {
    background: var(--flower-bg);
    color: var(--flower);
  }

  &.herb {
    background: var(--herb-bg);
    color: var(--herb);
  }

  &.vegetable {
    background: var(--veg-bg);
    color: var(--veg);
  }
}
</style>
