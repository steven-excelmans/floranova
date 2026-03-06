<template>
  <article
    class="plant-card"
    :class="{ 'out-of-stock': !inStock }"
    @click="$emit('select', plant.id)"
  >
    <!-- Image -->
    <div class="plant-img-wrap">
      <img
        v-if="cover"
        :src="cover.url"
        :alt="displayName"
        class="plant-img"
        loading="lazy"
        :style="cover.thumbFocalPoint
          ? { objectPosition: `${cover.thumbFocalPoint.x}% ${cover.thumbFocalPoint.y}%` }
          : {}"
        @error="onImgError"
      />
      <div v-if="imgError || !cover" class="plant-img-placeholder">
        <span class="material-icons-outlined">{{ plantIcon }}</span>
      </div>
      <span v-if="isFavorite" class="fav-badge">
        <span class="material-icons-outlined">favorite</span>
      </span>
    </div>

    <!-- Info -->
    <div class="plant-info">
      <!-- Block: Title + type icon -->
      <div class="block-title">
        <div class="title-text">
          <div class="plant-name">{{ displayName }} <span v-if="plant.variety" class="plant-variety">'{{ plant.variety }}'</span></div>
          <div class="plant-sub">
            <span class="plant-latin">{{ plant.latinName }}</span>
          </div>
        </div>
        <div class="type-icon" :class="plant.type">
          <span class="material-icons-outlined">{{ plantIcon }}</span>
        </div>
      </div>

      <!-- Status badge for non-verified plants -->
      <div v-if="plant.status !== 'verified'" class="plant-status" :class="`plant-status--${plant.status}`">
        <span class="material-icons-outlined">{{ plant.status === 'pending' ? 'hourglass_empty' : 'info' }}</span>
        {{ plant.status === 'pending' ? t('plant.pending') : t('plant.notVerified') }}
      </div>

      <!-- Block: Sun requirement -->
      <div class="plant-sun">
        <span class="material-icons-outlined">{{ sunIcon }}</span>
        {{ t(`plant.${plant.sun}`) }}
      </div>

      <!-- Block: Mini calendar -->
      <div class="plant-calendar-group">
        <!-- Sowing row -->
        <div class="cal-row">
          <div class="cal-row__label">
            <svg v-if="isTuber" class="cal-svg-icon tuber-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5C6.5 3.5 4 6 4 9c0 2.2 1.8 3.5 4 3.5s4-1.3 4-3.5c0-3-2.5-5.5-4-5.5z"/><path d="M8 5.5c-.8 1.2-1.2 2.5-1.2 3.8" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/><path d="M7.2 3.8C7 2.8 7.3 1.5 8 1c.7.5 1 1.8.8 2.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 12.5c.2.5.2 1 .1 1.3M8 12.5v1.3M9.5 12.5c-.2.5-.2 1-.1 1.3" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round"/></svg>
            <svg v-else class="cal-svg-icon seed-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C8 1 5 5 5 9c0 1.66 1.34 3 3 3s3-1.34 3-3C11 5 8 1 8 1z"/><path d="M8 5.5v4" stroke="white" stroke-width="0.8" fill="none" opacity="0.4"/></svg>
          </div>
          <div class="cal-row__bars">
            <div
              v-for="month in 12"
              :key="'sow-' + month"
              class="cal-bar"
              :class="{ sowing: isSowingMonth(month) }"
            />
          </div>
        </div>
        <!-- Bloom/produce row -->
        <div v-if="hasBloomPeriod" class="cal-row">
          <div class="cal-row__label cal-row__label--bloom">
            <span class="material-icons-outlined">{{ bloomIcon }}</span>
          </div>
          <div class="cal-row__bars">
            <div
              v-for="month in 12"
              :key="'bloom-' + month"
              class="cal-bar"
              :class="{ bloom: inRange(month, plant.calendar.harvestPeriod) }"
            />
          </div>
        </div>
      </div>

      <!-- Colors + Stock (same line) -->
      <div class="colors-stock-row">
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

        <div class="stock-badge" @click.stop="$emit('toggle-stock', plant.id)">
          <span class="stock-leaf" :class="inStock ? 'in-stock' : 'out-of-stock'" />
          <span class="stock-text" :class="inStock ? 'in-stock' : 'out-of-stock'">
            {{ inStock ? t('stock.inStock') : t('stock.notInStock') }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Plant } from 'src/types/plant';
import { getCardPreviewImage } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';

const props = defineProps<{
  plant: Plant;
  inStock: boolean;
  isFavorite?: boolean;
}>();

defineEmits<{
  select: [id: string];
  'toggle-stock': [id: string];
}>();

const { t } = useI18n();
const { localize } = useLocale();

const cover = computed(() => getCardPreviewImage(props.plant.images));

const displayName = computed(() => {
  const full = localize(props.plant.name);
  // Strip variety from display name since we show it separately
  if (props.plant.variety && full.endsWith(props.plant.variety)) {
    return full.slice(0, -props.plant.variety.length).trimEnd();
  }
  return full;
});
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
const isTuber = computed(() => props.plant.propagation === 'tuber');

const bloomIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'nutrition',
  vegetable: 'nutrition',
};

const bloomIcon = computed(() => bloomIconMap[props.plant.type] ?? 'local_florist');

const hasBloomPeriod = computed(() =>
  props.plant.calendar.harvestPeriod && props.plant.calendar.harvestPeriod.length > 0
);

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

function inRange(month: number, range: number[] | null): boolean {
  if (!range) return false;
  return range.includes(month);
}

function isSowingMonth(month: number): boolean {
  const cal = props.plant.calendar;
  return inRange(month, cal.indoorSowing)
    || inRange(month, cal.coldGreenhouse)
    || inRange(month, cal.outdoor);
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
  flex-shrink: 0;
  border-radius: 16px 12px 16px 12px;
  overflow: hidden;
  position: relative;
  background: var(--sand);
}

.fav-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(254, 252, 247, 0.8);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  .material-icons-outlined {
    font-size: 12px;
    color: var(--flower);
  }
}

.plant-img {
  position: absolute;
  inset: 0;
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
  gap: 12px;
}

// ── Block: Title + type icon ──
.block-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.plant-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--deep-brown);
  line-height: 1.25;
  letter-spacing: -0.1px;
}

.plant-sub {
  font-size: 12px;
  line-height: 1.2;
  color: var(--muted);
}

.plant-latin {
  font-style: italic;
}

.plant-variety {
  font-weight: 400;
  color: var(--muted-light);
  font-style: italic;
  font-size: 13px;
}

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

.plant-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  width: fit-content;

  .material-icons-outlined {
    font-size: 12px;
  }

  &--pending {
    color: var(--clay);
    background: var(--clay-pale);
  }

  &--unverified {
    color: var(--cal-indoor);
    background: rgba(125, 161, 184, 0.12);
  }
}

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
.plant-calendar-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cal-row {
  display: flex;
  align-items: center;
  gap: 0;
}

.cal-row__label {
  width: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .cal-svg-icon {
    width: 10px;
    height: 10px;

    &.seed-icon {
      color: var(--muted-light);
    }

    &.tuber-icon {
      color: var(--tuber);
    }
  }

  &--bloom .material-icons-outlined {
    font-size: 10px;
    color: var(--muted-light);
  }
}

.cal-row__bars {
  flex: 1;
  display: flex;
  gap: 2.5px;
}

.cal-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--cal-empty);

  &.sowing {
    background: var(--moss);
    opacity: 0.55;
  }

  &.bloom {
    background: var(--cal-bloom, #D4A0B0);
  }
}

// ── Colors + Stock row ──
.colors-stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.plant-colors {
  display: flex;
  gap: 5px;
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
  flex-shrink: 0;
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
