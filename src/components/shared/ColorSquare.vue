<template>
  <div
    class="color-swatch"
    :style="{ backgroundColor: color.hex }"
    :title="color.name"
  />
</template>

<script setup lang="ts">
import type { PlantColor } from 'src/types/plant';

defineProps<{ color: PlantColor }>();
</script>

<style scoped lang="scss">
.color-swatch {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-light);
  transition: transform 0.15s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.12);
  }
}
</style>
