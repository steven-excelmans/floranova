<template>
  <div class="monthly-card" @click="$emit('select', plant.id)">
    <div class="monthly-card__avatar">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="displayName"
        loading="lazy"
      />
      <span v-else class="material-icons-outlined">{{ plantIcon }}</span>
    </div>

    <div class="monthly-card__info">
      <div class="monthly-card__name">
        {{ displayName }}
        <span
          v-if="showGermination && plant.propagation === 'seed' && plant.germination"
          class="germ-icon"
          :class="plant.germination"
        >
          <span class="material-icons-outlined">{{ plant.germination === 'light' ? 'light_mode' : 'dark_mode' }}</span>
        </span>
      </div>
      <div class="monthly-card__latin">{{ plant.latinName }}</div>

      <!-- Mini bloom/harvest bar -->
      <div v-if="harvestMonths && harvestMonths.length" class="bloom-bar">
        <div
          v-for="m in 12"
          :key="m"
          class="bloom-bar__seg"
          :class="{
            'bloom-bar__seg--active': harvestMonths.includes(m),
            'bloom-bar__seg--current': m === currentMonth && harvestMonths.includes(m),
          }"
        />
      </div>
    </div>

    <div class="type-icon" :class="plant.type">
      <span class="material-icons-outlined">{{ plantIcon }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plant } from 'src/types/plant';
import { getCardPreviewImage } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';

const props = defineProps<{
  plant: Plant;
  currentMonth: number;
  showGermination: boolean;
}>();
defineEmits<{ select: [id: string] }>();

const { localize } = useLocale();
const displayName = computed(() => localize(props.plant.name));
const coverUrl = computed(() => {
  const img = getCardPreviewImage(props.plant.images);
  return img?.url ?? null;
});

const plantIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};
const plantIcon = computed(() => plantIconMap[props.plant.type] ?? 'local_florist');

const harvestMonths = computed(() => props.plant.calendar.harvestPeriod);
</script>

<style scoped lang="scss">
.monthly-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--warm-white);
  border-radius: var(--radius-md);
  margin: 0 20px 8px;
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
  &:nth-child(7) { animation-delay: 0.24s; }

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

/* ── Germination icon ── */
.germ-icon {
  .material-icons-outlined {
    font-size: 14px;
    vertical-align: -2px;
    margin-left: 3px;
  }

  &.light .material-icons-outlined {
    color: var(--cal-outdoor);
  }

  &.dark .material-icons-outlined {
    color: var(--cal-indoor);
  }
}

/* ── Type icon badge ── */
.type-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .material-icons-outlined {
    font-size: 15px;
  }

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

/* ── Bloom/harvest mini bar ── */
.bloom-bar {
  display: flex;
  gap: 2px;
  margin-top: 5px;
}

.bloom-bar__seg {
  flex: 1;
  height: 3px;
  border-radius: 1.5px;
  background: var(--cal-empty, #E8E3DB);

  &--active {
    background: var(--cal-bloom);
    opacity: 0.6;
  }

  &--current {
    background: var(--cal-bloom);
    opacity: 1;
    height: 4px;
    border-radius: 2px;
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
