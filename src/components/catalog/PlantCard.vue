<template>
  <article
    class="plant-card"
    :class="{ 'out-of-stock': !inStock }"
    @click="$emit('select', plant.id)"
  >
    <!-- Image -->
    <div class="plant-img-wrap">
      <img
        v-if="plant.images.length > 0"
        :src="plant.images[0]"
        :alt="displayName"
        class="plant-img"
        loading="lazy"
        @error="onImgError"
      />
      <div v-if="imgError || plant.images.length === 0" class="plant-img-placeholder">
        <span class="material-icons-outlined">{{ plantIcon }}</span>
      </div>
    </div>

    <!-- Info -->
    <div class="plant-info">
      <div class="plant-name">{{ displayName }}</div>
      <div class="plant-latin">{{ plant.latinName }}</div>

      <PlantTypeBadge :type="plant.type" />

      <div class="plant-sun">
        <span class="material-icons-outlined">{{ sunIcon }}</span>
        {{ t(`plant.${plant.sun}`) }}
      </div>

      <!-- Mini calendar: 12 bars (Jan–Dec) -->
      <div class="plant-calendar">
        <div
          v-for="month in 12"
          :key="month"
          class="cal-bar"
          :class="calBarClasses(month)"
        />
      </div>

      <!-- Color dots -->
      <div v-if="plant.colors.length" class="plant-colors">
        <span
          v-for="color in plant.colors.slice(0, 6)"
          :key="color.name"
          class="color-dot"
          :class="{ 'is-light': isLight(color.hex) }"
          :style="{ background: color.hex }"
          :title="color.name"
        />
        <span v-if="plant.colors.length > 6" class="color-more">
          +{{ plant.colors.length - 6 }}
        </span>
      </div>

      <!-- Stock badge -->
      <div class="stock-badge" @click.stop="$emit('toggle-stock', plant.id)">
        <span class="stock-leaf" :class="inStock ? 'in-stock' : 'out-of-stock'" />
        <span class="stock-text" :class="inStock ? 'in-stock' : 'out-of-stock'">
          {{ inStock ? t('stock.inStock') : t('stock.notInStock') }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Plant } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';
import PlantTypeBadge from 'src/components/shared/PlantTypeBadge.vue';

const props = defineProps<{
  plant: Plant;
  inStock: boolean;
}>();

defineEmits<{
  select: [id: string];
  'toggle-stock': [id: string];
}>();

const { t } = useI18n();
const { localize } = useLocale();

const displayName = computed(() => localize(props.plant.name));
const imgError = ref(false);

function onImgError() {
  imgError.value = true;
}

const plantIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};

const plantIcon = computed(() => plantIconMap[props.plant.type] ?? 'local_florist');

const sunIconMap: Record<string, string> = {
  'full-sun': 'light_mode',
  'partial-shade': 'contrast',
  shade: 'wb_cloudy',
};

const sunIcon = computed(() => sunIconMap[props.plant.sun] ?? 'light_mode');

function isLight(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}

/**
 * Determine CSS classes for a given month bar (1-based).
 * Calendar fields: indoorSowing [start, end], coldGreenhouse [start, end], outdoor [start, end]
 * MonthRange is [startMonth, endMonth] (1-indexed, inclusive) or null.
 */
function inRange(month: number, range: [number, number] | null): boolean {
  if (!range) return false;
  const [start, end] = range;
  // Handle ranges that wrap across year boundary (e.g. [11, 2])
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}

function calBarClasses(month: number): Record<string, boolean> {
  const cal = props.plant.calendar;
  const isIndoor = inRange(month, cal.indoorSowing);
  const isCold = inRange(month, cal.coldGreenhouse);
  const isOutdoor = inRange(month, cal.outdoor);

  return {
    indoor: isIndoor && !isCold && !isOutdoor,
    cold: isCold && !isIndoor && !isOutdoor,
    outdoor: isOutdoor && !isIndoor && !isCold,
    'indoor-cold': isIndoor && isCold && !isOutdoor,
    'cold-outdoor': isCold && isOutdoor && !isIndoor,
    'indoor-outdoor': isIndoor && isOutdoor && !isCold,
  };
}
</script>

<style scoped lang="scss">
.plant-card {
  display: flex;
  gap: 14px;
  background: var(--warm-white);
  border-radius: var(--radius-card);
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.985);
    transition: transform 0.1s ease;
  }

  &.out-of-stock {
    opacity: 0.72;

    &:hover {
      opacity: 0.85;
    }
  }
}

// ── Image ──
.plant-img-wrap {
  width: 110px;
  height: 130px;
  flex-shrink: 0;
  align-self: flex-start;
  border-radius: 16px 12px 16px 12px;
  overflow: hidden;
  position: relative;
  background: var(--sand);
}

.plant-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}

.plant-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #EDE8DF, #E0D9CE);
  position: relative;

  .material-icons-outlined {
    font-size: 36px;
    color: var(--muted-light);
    opacity: 0.5;
  }

  &::before {
    content: '';
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 55% 45% 50% 50% / 45% 55% 45% 55%;
    background: var(--moss);
    opacity: 0.04;
    bottom: 10px;
    right: 10px;
  }
}

// ── Card body ──
.plant-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}

.plant-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--deep-brown);
  line-height: 1.25;
  letter-spacing: -0.1px;
}

.plant-latin {
  font-family: var(--font-body);
  font-size: 12px;
  font-style: italic;
  color: var(--muted);
  line-height: 1.2;
  margin-top: -1px;
}

// ── Sun requirement ──
.plant-sun {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 1px;

  .material-icons-outlined {
    font-size: 14px;
    color: var(--clay);
  }
}

// ── Mini calendar ──
.plant-calendar {
  display: flex;
  gap: 2.5px;
  margin-top: 3px;
  align-items: center;
}

.cal-bar {
  flex: 1;
  height: 3px;
  border-radius: 1.5px;
  background: var(--cal-empty);

  &.indoor {
    background: var(--cal-indoor);
  }

  &.cold {
    background: var(--cal-cold);
  }

  &.outdoor {
    background: var(--cal-outdoor);
  }

  &.indoor-cold {
    background: linear-gradient(180deg, var(--cal-indoor) 50%, var(--cal-cold) 50%);
  }

  &.indoor-outdoor {
    background: linear-gradient(180deg, var(--cal-indoor) 50%, var(--cal-outdoor) 50%);
  }

  &.cold-outdoor {
    background: linear-gradient(180deg, var(--cal-cold) 50%, var(--cal-outdoor) 50%);
  }
}

// ── Color dots ──
.plant-colors {
  display: flex;
  gap: 5px;
  margin-top: 3px;
  flex-wrap: wrap;
  align-items: center;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid rgba(53, 43, 34, 0.08);
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  &.is-light {
    border: 1.5px solid #D4D0C8;
  }
}

.color-more {
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
}

// ── Stock badge ──
.stock-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  cursor: pointer;
}

.stock-leaf {
  width: 14px;
  height: 8px;
  border-radius: 0 8px 0 8px;
  flex-shrink: 0;

  &.in-stock {
    background: var(--moss);
  }

  &.out-of-stock {
    background: #D4CEC5;
  }
}

.stock-text {
  font-size: 10.5px;
  font-weight: 500;

  &.in-stock {
    color: var(--moss);
  }

  &.out-of-stock {
    color: #B0A89E;
  }
}
</style>
