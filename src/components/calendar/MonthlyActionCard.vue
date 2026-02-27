<template>
  <div class="monthly-card" @click="$emit('select', plant.id)">
    <div class="monthly-card__avatar">
      <img
        v-if="plant.images[0]"
        :src="plant.images[0]"
        :alt="displayName"
        loading="lazy"
      />
      <span v-else class="material-icons-outlined">local_florist</span>
    </div>

    <div class="monthly-card__info">
      <div class="monthly-card__name">{{ displayName }}</div>
      <div class="monthly-card__latin">{{ plant.latinName }}</div>
    </div>

    <PlantTypeBadge :type="plant.type" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plant } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';
import PlantTypeBadge from 'src/components/shared/PlantTypeBadge.vue';

const props = defineProps<{ plant: Plant }>();
defineEmits<{ select: [id: string] }>();

const { localize } = useLocale();
const displayName = computed(() => localize(props.plant.name));
</script>

<style scoped lang="scss">
.monthly-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--warm-white);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  animation: cardFadeIn 0.3s ease both;

  &:hover {
    border-color: var(--border-light);
    box-shadow: 0 2px 12px rgba(53, 43, 34, 0.06);
  }

  &:active {
    transform: scale(0.985);
  }

  &:nth-child(2) { animation-delay: 0.04s; }
  &:nth-child(3) { animation-delay: 0.08s; }
  &:nth-child(4) { animation-delay: 0.12s; }
  &:nth-child(5) { animation-delay: 0.16s; }
  &:nth-child(6) { animation-delay: 0.20s; }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--border-light);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .material-icons-outlined {
      font-size: 20px;
      color: var(--muted);
      opacity: 0.4;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    color: var(--deep-brown);
    line-height: 1.25;
  }

  &__latin {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 400;
    color: var(--muted);
    font-style: italic;
    line-height: 1.3;
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
