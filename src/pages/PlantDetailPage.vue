<template>
  <!-- Not found state -->
  <q-page v-if="!plant" class="not-found">
    <div class="not-found__inner">
      <span class="material-icons-outlined not-found__icon">error_outline</span>
      <p>Plant not found</p>
      <button class="not-found__back" @click="router.push('/catalog')">
        <span class="material-icons-outlined">arrow_back</span>
        Back to catalog
      </button>
    </div>
  </q-page>

  <!-- Detail page -->
  <q-page v-else class="detail-page" data-page="plant-detail">

    <!-- ── 1. HERO ── -->
    <div class="hero" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <!-- Nav overlay inside hero -->
      <div class="sticky-nav">
        <button class="sticky-nav__btn" @click="router.back()">
          <span class="material-icons-outlined">arrow_back</span>
        </button>
        <button
          class="sticky-nav__btn"
          :class="{ 'sticky-nav__btn--fav-active': favoritesStore.isFavorite(plant.id) }"
          @click="favoritesStore.toggleFavorite(plant.id)"
        >
          <span class="material-icons-outlined">{{ favoritesStore.isFavorite(plant.id) ? 'favorite' : 'favorite_border' }}</span>
        </button>
      </div>
      <img
        v-if="currentImage"
        :src="currentImage.url"
        :alt="displayName"
        class="hero__img"
        :style="currentImage.focalPoint
          ? { objectPosition: `${currentImage.focalPoint.x}% ${currentImage.focalPoint.y}%` }
          : {}"
      />
      <div v-else class="hero__placeholder">
        <span class="material-icons-outlined hero__placeholder-icon">local_florist</span>
      </div>
      <div class="hero__overlay" />

      <!-- Image dots -->
      <div v-if="plant.images.length > 1" class="hero__dots">
        <button
          v-for="(_, idx) in plant.images"
          :key="idx"
          class="hero__dot"
          :class="{ 'hero__dot--active': imageIndex === idx }"
          @click="imageIndex = idx"
        />
      </div>
    </div>

    <!-- ── 2. CONTENT SHEET ── -->
    <div class="sheet">
      <div class="sheet__handle" />

      <!-- ── 2a. HEADER ── -->
      <div class="plant-header">
        <!-- Badge row: left = verified + stock, right = type icon -->
        <div class="meta-row">
          <div class="meta-left">
            <span v-if="plant.status === 'verified'" class="verified-badge">
              <span class="material-icons-outlined">verified</span>
              {{ t('plant.verified') }}
            </span>
            <span v-else-if="plant.status === 'pending'" class="status-badge status-badge--pending">
              <span class="material-icons-outlined">hourglass_empty</span>
              {{ t('plant.pending') }}
            </span>
            <span v-else class="status-badge status-badge--unverified">
              <span class="material-icons-outlined">info</span>
              {{ t('plant.notVerified') }}
            </span>

            <span
              class="stock-indicator"
              :class="stockStore.isInStock(plant.id) ? 'stock-indicator--in' : 'stock-indicator--out'"
              @click.stop="stockStore.toggleStock(plant.id)"
            >
              <span class="stock-leaf" />
              {{ stockStore.isInStock(plant.id) ? t('stock.inStock') : t('stock.notInStock') }}
            </span>
          </div>

          <div class="type-icon" :class="plant.type">
            <span class="material-icons-outlined">{{ plantIcon }}</span>
          </div>
        </div>

        <!-- Name: species + variety styled like catalog card -->
        <h1 class="plant-name">
          {{ displayName }}
          <span v-if="plant.variety" class="plant-variety">'{{ plant.variety }}'</span>
        </h1>
        <p class="plant-latin">{{ cleanLatinName }}</p>

        <!-- Color swatches -->
        <div v-if="plant.colors.length" class="color-row">
          <span
            v-for="color in plant.colors"
            :key="color.name"
            class="color-dot"
            :class="{ 'color-dot--light': isLightColor(color.hex) }"
            :style="{ background: color.hex }"
            :title="color.name"
          />
        </div>
      </div>

      <!-- ── 2b. QUICK FACTS GRID ── -->
      <div class="facts-grid">
        <div v-if="plant.lifecycle" class="fact-cell">
          <span class="material-icons-outlined">{{ lifecycleIcon }}</span>
          <span class="fact-label">{{ t('plant.lifecycle') }}</span>
          <span class="fact-value">{{ t(`plant.${plant.lifecycle}`) }}</span>
        </div>
        <div class="fact-cell">
          <span class="material-icons-outlined">{{ sunIcon }}</span>
          <span class="fact-label">{{ t('plant.exposure') }}</span>
          <span class="fact-value">{{ t(`plant.${plant.sun}`) }}</span>
        </div>
        <div v-if="plant.heightCm" class="fact-cell">
          <span class="material-icons-outlined">straighten</span>
          <span class="fact-label">{{ t('plant.height') }}</span>
          <span class="fact-value">{{ plant.heightCm.min }}–{{ plant.heightCm.max }} cm</span>
        </div>
      </div>

      <!-- ── 2c. TABS ── -->
      <div class="tabs-wrap">
        <div class="tabs">
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'calendar' }"
            @click="activeTab = 'calendar'"
          >
            {{ t('plant.calendar') }}
          </button>
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'growing' }"
            @click="activeTab = 'growing'"
          >
            {{ t('plant.growing') }}
          </button>
          <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'care' }"
            @click="activeTab = 'care'"
          >
            {{ t('plant.care') }}
          </button>
        </div>
      </div>

      <!-- ====== CALENDAR TAB ====== -->
      <div v-show="activeTab === 'calendar'" class="tab-panel">

        <!-- Sowing calendar card -->
        <div v-if="hasCalendarData" class="section-card">
          <div class="section-title">{{ t('plant.calendar') }}</div>

          <!-- Indoor sowing -->
          <div v-if="plant.calendar.indoorSowing?.length" class="cal-row">
            <div class="cal-icon">
              <span class="material-icons-outlined" style="color: var(--cal-indoor)">home</span>
            </div>
            <div class="cal-bars">
              <div
                v-for="m in 12"
                :key="'in-' + m"
                class="cal-bar"
                :class="{ 'cal-bar--indoor': inRange(m, plant.calendar.indoorSowing) }"
              />
            </div>
          </div>

          <!-- Cold greenhouse -->
          <div v-if="plant.calendar.coldGreenhouse?.length" class="cal-row">
            <div class="cal-icon">
              <span class="material-icons-outlined" style="color: var(--cal-cold)">warehouse</span>
            </div>
            <div class="cal-bars">
              <div
                v-for="m in 12"
                :key="'cold-' + m"
                class="cal-bar"
                :class="{ 'cal-bar--cold': inRange(m, plant.calendar.coldGreenhouse) }"
              />
            </div>
          </div>

          <!-- Outdoor -->
          <div v-if="plant.calendar.outdoor?.length" class="cal-row">
            <div class="cal-icon">
              <span class="material-icons-outlined" style="color: var(--cal-outdoor)">park</span>
            </div>
            <div class="cal-bars">
              <div
                v-for="m in 12"
                :key="'out-' + m"
                class="cal-bar"
                :class="{ 'cal-bar--outdoor': inRange(m, plant.calendar.outdoor) }"
              />
            </div>
          </div>

          <!-- Harvest / Bloom period -->
          <div v-if="hasHarvestPeriod" class="cal-row">
            <div class="cal-icon">
              <span class="material-icons-outlined" style="color: var(--cal-bloom)">{{ bloomIcon }}</span>
            </div>
            <div class="cal-bars">
              <div
                v-for="m in 12"
                :key="'bloom-' + m"
                class="cal-bar"
                :class="{ 'cal-bar--bloom': inRange(m, plant.calendar.harvestPeriod) }"
              />
            </div>
          </div>

          <!-- Legend -->
          <div class="cal-legend">
            <div v-if="plant.calendar.indoorSowing?.length" class="cal-legend-item">
              <div class="cal-legend-dot" style="background: var(--cal-indoor)" />
              {{ isTuber ? t('calendar.preSproutIndoors') : t('catalog.calIndoor') }}
            </div>
            <div v-if="plant.calendar.coldGreenhouse?.length" class="cal-legend-item">
              <div class="cal-legend-dot" style="background: var(--cal-cold)" />
              {{ t('calendar.coldGreenhouse') }}
            </div>
            <div v-if="plant.calendar.outdoor?.length" class="cal-legend-item">
              <div class="cal-legend-dot" style="background: var(--cal-outdoor)" />
              {{ isTuber ? t('calendar.plantOutdoors') : t('catalog.calOutdoor') }}
            </div>
            <div v-if="hasHarvestPeriod" class="cal-legend-item">
              <div class="cal-legend-dot" style="background: var(--cal-bloom)" />
              {{ plant.type === 'flower' ? t('plant.bloom') : t('plant.harvest') }}
            </div>
          </div>
        </div>

        <!-- Planting conditions -->
        <div v-if="plant.plantingConditions.length" class="section-card">
          <div class="section-title">{{ t('plant.plantingConditions') }}</div>
          <div class="conditions-row">
            <span
              v-for="cond in plant.plantingConditions"
              :key="cond"
              class="condition-chip"
            >
              <svg v-if="isPotCondition(cond)" class="condition-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10h10l-1.5 9H8.5L7 10z"/><path d="M6 7h12v3H6z"/></svg>
              <span v-else class="material-icons-outlined">{{ conditionIcon(cond) }}</span>
              {{ t(`plant.${cond}`) }}
            </span>
          </div>
        </div>
      </div>

      <!-- ====== GROWING TAB ====== -->
      <div v-show="activeTab === 'growing'" class="tab-panel">

        <!-- Germination (hidden for tubers) -->
        <div v-if="!isTuber" class="section-card">
          <div class="section-title">{{ t('plant.germination') }}</div>
          <div class="detail-list">
            <div class="detail-item">
              <div class="detail-icon">
                <span class="material-icons-outlined">{{ plant.germination === 'dark' ? 'dark_mode' : 'light_mode' }}</span>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.type') }}</div>
                <div class="detail-text__value">{{ t(`plant.${plant.germination}`) }}</div>
              </div>
            </div>
            <div v-if="plant.germinationDays" class="detail-item">
              <div class="detail-icon">
                <span class="material-icons-outlined">schedule</span>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.germinationTime') }}</div>
                <div class="detail-text__value">{{ plant.germinationDays.min }}–{{ plant.germinationDays.max }} {{ t('careCondition.days') }}</div>
              </div>
            </div>
            <div v-if="plant.germinationTempC" class="detail-item">
              <div class="detail-icon">
                <span class="material-icons-outlined">thermostat</span>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.germinationTemp') }}</div>
                <div class="detail-text__value">{{ plant.germinationTempC.min }}–{{ plant.germinationTempC.max }} &deg;C</div>
              </div>
            </div>
            <div v-if="plant.sowingDepthMm" class="detail-item">
              <div class="detail-icon">
                <span class="material-icons-outlined">arrow_downward</span>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.sowingDepth') }}</div>
                <div class="detail-text__value">{{ plant.sowingDepthMm }} mm</div>
              </div>
            </div>
            <div v-if="plant.seedsPerCell" class="detail-item">
              <div class="detail-icon">
                <span class="material-icons-outlined">grain</span>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.seedsPerCell') }}</div>
                <div class="detail-text__value">{{ plant.seedsPerCell }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tuber propagation info -->
        <div v-if="isTuber" class="section-card">
          <div class="section-title">{{ t('plant.propagation') }}</div>
          <div class="detail-list">
            <div class="detail-item">
              <div class="detail-icon detail-icon--tuber">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5C6.5 3.5 4 6 4 9c0 2.2 1.8 3.5 4 3.5s4-1.3 4-3.5c0-3-2.5-5.5-4-5.5z"/><path d="M8 5.5c-.8 1.2-1.2 2.5-1.2 3.8" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/><path d="M7.2 3.8C7 2.8 7.3 1.5 8 1c.7.5 1 1.8.8 2.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 12.5c.2.5.2 1 .1 1.3M8 12.5v1.3M9.5 12.5c-.2.5-.2 1-.1 1.3" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round"/></svg>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.type') }}</div>
                <div class="detail-text__value">{{ t('plant.tuber') }}</div>
              </div>
            </div>
            <div v-if="plant.sowingDepthMm" class="detail-item">
              <div class="detail-icon">
                <span class="material-icons-outlined">arrow_downward</span>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.plantingDepth') }}</div>
                <div class="detail-text__value">{{ plant.sowingDepthMm }} mm</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spacing -->
        <div v-if="plant.minDistanceCm" class="section-card">
          <div class="section-title">{{ t('plant.spacing') }}</div>
          <div class="detail-list">
            <div class="detail-item">
              <div class="detail-icon">
                <span class="material-icons-outlined">swap_horiz</span>
              </div>
              <div class="detail-text">
                <div class="detail-text__label">{{ t('plant.minDistance') }}</div>
                <div class="detail-text__value">{{ plant.minDistanceCm }} cm</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pinching highlight -->
        <div v-if="plant.pinching" class="highlight-banner">
          <div class="highlight-icon">
            <span class="material-icons-outlined">content_cut</span>
          </div>
          <div class="highlight-text">
            <strong>{{ t('plant.pinchingYes') }}</strong>
          </div>
        </div>
      </div>

      <!-- ====== CARE TAB ====== -->
      <div v-show="activeTab === 'care'" class="tab-panel">

        <!-- Care steps -->
        <div v-if="sortedCareSteps.length" class="section-card">
          <div class="section-title">{{ t('plant.postGerminationCare') }}</div>
          <div class="care-steps">
            <div
              v-for="(step, idx) in sortedCareSteps"
              :key="step.order"
              class="care-step"
            >
              <div class="step-number">{{ idx + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ localize(step.action) }}</div>
                <div class="step-when">{{ localize(step.condition.description) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="additionalNotes || stemTipsText" class="section-card">
          <div class="section-title">{{ t('plant.notes') }}</div>

          <div v-if="additionalNotes" class="note-block">
            <div class="note-block__title">
              <span class="material-icons-outlined">spa</span>
              {{ t('plant.maintenance') }}
            </div>
            <p class="note-block__text">{{ additionalNotes }}</p>
          </div>

          <div v-if="additionalNotes && stemTipsText" class="note-divider" />

          <div v-if="stemTipsText" class="note-block">
            <div class="note-block__title note-block__title--clay">
              <span class="material-icons-outlined">cut</span>
              {{ t('plant.stemTips') }}
            </div>
            <p class="note-block__text">{{ stemTipsText }}</p>
          </div>
        </div>
      </div>

      <!-- ── ACTION BUTTON ── -->
      <div class="action-row">
        <button class="btn-primary" @click="showAddPlanting = true">
          <span class="material-icons-outlined">add</span>
          {{ t('plant.addToGarden') }}
        </button>
      </div>
    </div>

    <!-- Add planting dialog -->
    <AddPlantingDialog
      v-model="showAddPlanting"
      :pre-selected-plant-id="plant.id"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { useStockStore } from 'src/stores/stock-store';
import { useFavoritesStore } from 'src/stores/favorites-store';
import { useLocale } from 'src/composables/useLocale';
import { normalizeImage } from 'src/types/plant';
import AddPlantingDialog from 'src/components/garden/AddPlantingDialog.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();
const favoritesStore = useFavoritesStore();
const { localize } = useLocale();

// ── Plant data ──
const plant = computed(() =>
  plantStore.getPlantById(route.params.id as string),
);

const displayName = computed(() => {
  if (!plant.value) return '';
  const full = localize(plant.value.name);
  const v = plant.value.variety;
  if (!v) return full;
  if (full.endsWith(v)) return full.slice(0, -v.length).trimEnd();
  if (full.endsWith(`'${v}'`)) return full.slice(0, -(v.length + 2)).trimEnd();
  if (full.endsWith(`'${v}'`)) return full.slice(0, -(v.length + 2)).trimEnd();
  return full;
});

const cleanLatinName = computed(() => {
  if (!plant.value) return '';
  const latin = plant.value.latinName;
  const v = plant.value.variety;
  if (!v) return latin;
  if (latin.endsWith(`'${v}'`)) return latin.slice(0, -(v.length + 2)).trimEnd();
  if (latin.endsWith(`'${v}'`)) return latin.slice(0, -(v.length + 2)).trimEnd();
  return latin;
});

const isTuber = computed(() => plant.value?.propagation === 'tuber');

// ── Image handling ──
const imageIndex = ref(0);

const currentImage = computed(() => {
  if (!plant.value?.images.length) return null;
  const raw = plant.value.images[imageIndex.value] ?? plant.value.images[0];
  return raw ? normalizeImage(raw) : null;
});

// Touch swipe on hero
let touchStartX = 0;
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]!.clientX;
}
function onTouchEnd(e: TouchEvent) {
  if (!plant.value) return;
  const diff = touchStartX - e.changedTouches[0]!.clientX;
  const maxIdx = plant.value.images.length - 1;
  if (Math.abs(diff) > 50) {
    if (diff > 0 && imageIndex.value < maxIdx) imageIndex.value++;
    if (diff < 0 && imageIndex.value > 0) imageIndex.value--;
  }
}


// ── Override parent bg to warm-white while detail page is active ──
onMounted(() => {
  document.documentElement.style.setProperty('background', 'var(--warm-white)');
  document.body.style.setProperty('background', 'var(--warm-white)');
  document.querySelector('.q-page-container')?.setAttribute('style',
    'background: var(--warm-white); position: relative; z-index: 1;');
});
onUnmounted(() => {
  document.documentElement.style.removeProperty('background');
  document.body.style.removeProperty('background');
  document.querySelector('.q-page-container')?.removeAttribute('style');
});

// ── Tabs ──
const activeTab = ref<'calendar' | 'growing' | 'care'>('calendar');
const showAddPlanting = ref(false);

// ── Icon maps ──
const plantIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};
const plantIcon = computed(() => plantIconMap[plant.value?.type ?? ''] ?? 'local_florist');

const sunIconMap: Record<string, string> = {
  'full-sun': 'light_mode',
  'partial-shade': 'contrast',
  shade: 'wb_cloudy',
};
const sunIcon = computed(() => sunIconMap[plant.value?.sun ?? ''] ?? 'light_mode');

const lifecycleIconMap: Record<string, string> = {
  annual: 'filter_1',
  biennial: 'filter_2',
  perennial: 'all_inclusive',
};
const lifecycleIcon = computed(() => lifecycleIconMap[plant.value?.lifecycle ?? ''] ?? 'filter_1');

const bloomIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'nutrition',
  vegetable: 'nutrition',
};
const bloomIcon = computed(() => bloomIconMap[plant.value?.type ?? ''] ?? 'local_florist');

const POT_CONDITIONS = new Set(['pot', 'p9-pot', 'small-pot', 'big-pot']);

function isPotCondition(cond: string): boolean {
  return POT_CONDITIONS.has(cond);
}

function conditionIcon(cond: string): string {
  const map: Record<string, string> = {
    tray: 'grid_view',
    'module-tray': 'grid_view',
    outdoor: 'yard',
    'outside-direct': 'park',
    'sprout-tray': 'grass',
  };
  return map[cond] ?? 'eco';
}

// ── Calendar helpers ──
const hasCalendarData = computed(() => {
  if (!plant.value) return false;
  const cal = plant.value.calendar;
  return [cal.indoorSowing, cal.coldGreenhouse, cal.outdoor, cal.harvestPeriod]
    .some(r => r && r.length > 0);
});

const hasHarvestPeriod = computed(() =>
  plant.value?.calendar.harvestPeriod && plant.value.calendar.harvestPeriod.length > 0,
);

function inRange(month: number, range: number[] | null): boolean {
  if (!range) return false;
  return range.includes(month);
}

// ── Care steps ──
const sortedCareSteps = computed(() =>
  plant.value ? [...plant.value.careSteps].sort((a, b) => a.order - b.order) : [],
);

// ── Text fields ──
const additionalNotes = computed(() =>
  plant.value ? localize(plant.value.maintenanceNotes) : '',
);

const stemTipsText = computed(() =>
  plant.value?.stemTips ? localize(plant.value.stemTips) : '',
);

// ── Helpers ──
function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}
</script>

<style scoped lang="scss">
/* ── Page wrapper ── */
.detail-page {
  position: relative;
  min-height: 100vh;
  background: var(--warm-white);
  padding: 0 !important;
}

/* ── Not found ── */
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;

  &__inner { text-align: center; padding: 24px; }

  &__icon {
    font-size: 48px;
    color: var(--muted-light);
    display: block;
    margin-bottom: 12px;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: var(--radius-pill);
    background: var(--moss-pale);
    color: var(--moss);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
}

/* ══════════════════════════════════════
   0. STICKY NAV (JS-driven floating)
   ══════════════════════════════════════ */
.sticky-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  pointer-events: none;
}

.sticky-nav__btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(254, 252, 247, 0.8);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: none;
  transition: transform 0.15s ease, background 0.2s ease;
  pointer-events: auto;

  .material-icons-outlined {
    font-size: 20px;
    color: var(--deep-brown);
  }

  &:active { transform: scale(0.92); }

  &--fav-active {
    background: rgba(254, 252, 247, 0.8);

    .material-icons-outlined {
      color: var(--flower);
    }
  }
}

/* ══════════════════════════════════════
   1. HERO
   ══════════════════════════════════════ */
.hero {
  position: relative;
  width: 100%;
  height: 380px;
  overflow: hidden;
}

.hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: contrast(1.06) saturate(1.08);
}

.hero__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 30% 60%, rgba(123, 148, 112, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 30%, rgba(184, 136, 110, 0.10) 0%, transparent 50%),
    linear-gradient(175deg, #E8E2D6 0%, #DDD6CB 40%, #D4CFC5 100%);
}

.hero__placeholder-icon {
  font-size: 80px;
  color: var(--moss);
  opacity: 0.18;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(53, 43, 34, 0.08) 0%,
    transparent 30%,
    transparent 60%,
    rgba(53, 43, 34, 0.35) 100%
  );
  pointer-events: none;
}

.hero__dots {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}

.hero__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(254, 252, 247, 0.4);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &--active {
    background: rgba(254, 252, 247, 0.95);
    width: 20px;
    border-radius: 4px;
  }
}

/* ══════════════════════════════════════
   2. CONTENT SHEET
   ══════════════════════════════════════ */
.sheet {
  position: relative;
  margin-top: -28px;
  background: var(--warm-white);
  border-radius: 24px 24px 0 0;
  z-index: 5;
  padding-bottom: 40px;
  min-height: 500px;
  box-shadow: 0 -4px 20px rgba(53, 43, 34, 0.08);
}

.sheet__handle {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;

  &::after {
    content: '';
    width: 36px;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
  }
}

/* ── 2a. Header ── */
.plant-header {
  padding: 6px 24px 0;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: var(--moss-pale);
  color: var(--moss);
  border-radius: var(--radius-pill);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;

  .material-icons-outlined { font-size: 11px; }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;

  .material-icons-outlined { font-size: 11px; }

  &--pending {
    background: var(--clay-pale);
    color: var(--clay);
  }

  &--unverified {
    background: rgba(125, 161, 184, 0.12);
    color: var(--cal-indoor);
  }
}

.stock-indicator {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-pill);
  transition: background 0.2s ease;

  &:hover { background: var(--sand); }

  &--in { color: var(--moss); }
  &--out { color: var(--muted-light); }
}

.stock-leaf {
  width: 12px;
  height: 7px;
  border-radius: 0 7px 0 7px;
  flex-shrink: 0;

  .stock-indicator--in & { background: var(--moss); }
  .stock-indicator--out & { background: #D4CEC5; }
}

.type-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .material-icons-outlined { font-size: 17px; }

  &.flower { background: var(--flower-bg); color: var(--flower); }
  &.herb { background: var(--herb-bg); color: var(--herb); }
  &.vegetable { background: var(--veg-bg); color: var(--veg); }
}

.plant-name {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1.15;
  margin-bottom: 2px;
  letter-spacing: -0.02em;
}

.plant-variety {
  font-weight: 400;
  color: var(--muted-light);
  font-style: italic;
  font-size: 22px;
}

.plant-latin {
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--muted);
  font-style: italic;
  margin-bottom: 14px;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--warm-white);
  box-shadow: 0 0 0 1px var(--border);
  flex-shrink: 0;

  &--light { box-shadow: 0 0 0 1px #D4D0C8; }
}

/* ── 2b. Quick facts grid ── */
.facts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin: 0 24px 20px;
}

.fact-cell {
  background: var(--warm-white);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;

  .material-icons-outlined {
    font-size: 19px;
    color: var(--clay);
  }
}

.fact-label {
  font-size: 9.5px;
  color: var(--muted-light);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

.fact-value {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--deep-brown);
  font-weight: 600;
  line-height: 1.2;
}

/* ── 2c. Tabs ── */
.tabs-wrap {
  padding: 0 24px;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  background: var(--sand);
  border-radius: var(--radius-pill);
  padding: 3px;
  gap: 2px;
  border: 1px solid var(--border-light);
}

.tab {
  flex: 1;
  padding: 10px 4px;
  text-align: center;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  border: none;
  background: transparent;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;

  &:hover:not(.tab--active) {
    color: var(--deep-brown);
    background: rgba(254, 252, 247, 0.5);
  }

  &:active:not(.tab--active) {
    transform: scale(0.96);
  }

  &--active {
    background: var(--warm-white);
    color: var(--deep-brown);
    font-weight: 700;
    box-shadow: 0 1px 6px rgba(53, 43, 34, 0.1), 0 0 0 0.5px rgba(53, 43, 34, 0.04);
  }
}

/* ── Tab panels ── */
.tab-panel {
  padding: 0 24px;
}

/* ── Section cards ── */
.section-card {
  background: var(--warm-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 14px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

/* ══════════════════════════════════════
   CALENDAR — FLAT BARS
   ══════════════════════════════════════ */
.cal-row {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 6px;

  &:last-of-type { margin-bottom: 0; }
}

.cal-icon {
  width: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .material-icons-outlined { font-size: 14px; }
}

.cal-bars {
  flex: 1;
  display: flex;
  gap: 2.5px;
}

.cal-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--cal-empty, #EDEAE4);
  transition: background 0.2s ease;

  &--indoor { background: var(--cal-indoor); }
  &--cold { background: var(--cal-cold); }
  &--outdoor { background: var(--cal-outdoor); }
  &--bloom { background: var(--cal-bloom); }
}

.cal-legend {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.cal-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
}

.cal-legend-dot {
  width: 8px;
  height: 4px;
  border-radius: 2px;
}

/* ── Planting conditions ── */
.conditions-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.condition-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  background: var(--sand);
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
  color: var(--deep-brown);

  .material-icons-outlined {
    font-size: 14px;
    color: var(--moss);
  }

  .condition-svg {
    width: 14px;
    height: 14px;
    color: var(--moss);
  }
}

/* ══════════════════════════════════════
   GROWING TAB — DETAIL LIST
   ══════════════════════════════════════ */
.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child { border-bottom: none; padding-bottom: 0; }
  &:first-child { padding-top: 0; }
}

.detail-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--sand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;

  .material-icons-outlined {
    font-size: 16px;
    color: var(--clay);
  }

  &--tuber {
    background: var(--tuber-bg, #F0E0D4);

    svg {
      width: 16px;
      height: 16px;
      color: var(--tuber, #B07D62);
    }
  }
}

.detail-text { flex: 1; }

.detail-text__label {
  font-size: 10.5px;
  color: var(--muted-light);
  font-weight: 500;
  margin-bottom: 1px;
}

.detail-text__value {
  font-family: var(--font-display);
  font-size: 13.5px;
  color: var(--deep-brown);
  font-weight: 600;
}

/* ── Pinching highlight ── */
.highlight-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--moss-pale), rgba(230, 235, 226, 0.5));
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
}

.highlight-icon {
  width: 30px;
  height: 30px;
  background: var(--moss);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .material-icons-outlined {
    font-size: 16px;
    color: white;
  }
}

.highlight-text {
  font-size: 12px;
  color: var(--deep-brown);
  font-weight: 500;
  line-height: 1.45;

  strong { font-weight: 700; }
}

/* ══════════════════════════════════════
   CARE TAB
   ══════════════════════════════════════ */
.care-steps { position: relative; }

.care-step {
  display: flex;
  gap: 12px;
  position: relative;
  padding-bottom: 18px;

  &:last-child { padding-bottom: 0; }

  &::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 30px;
    bottom: 0;
    width: 1.5px;
    background: var(--border);
  }

  &:last-child::before { display: none; }
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--clay-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--clay);
  z-index: 1;
}

.step-content {
  flex: 1;
  padding-top: 3px;
}

.step-title {
  font-family: var(--font-display);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--deep-brown);
  margin-bottom: 2px;
}

.step-when {
  font-size: 11.5px;
  color: var(--muted);
}

/* ── Notes ── */
.note-block { margin-bottom: 14px; }
.note-block:last-child { margin-bottom: 0; }

.note-block__title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: var(--clay);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 4px;

  .material-icons-outlined { font-size: 14px; }

  &--clay { color: var(--clay); }
}

.note-block__text {
  font-size: 13px;
  color: var(--deep-brown);
  line-height: 1.65;
}

.note-divider {
  height: 1px;
  background: var(--border-light);
  margin: 14px 0;
}

/* ── Action button ── */
.action-row {
  padding: 0 24px;
  margin-top: 8px;
  margin-bottom: 16px;
}

.btn-primary {
  width: 100%;
  padding: 14px 20px;
  background: var(--moss);
  color: white;
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 0.01em;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  .material-icons-outlined { font-size: 19px; }

  &:hover { box-shadow: 0 4px 16px rgba(92, 107, 78, 0.3); }
  &:active { transform: scale(0.97); }
}
</style>

<style lang="scss">
/* Unscoped: override parent container bg when detail page is active */
.q-page-container:has([data-page="plant-detail"]) {
  background: var(--warm-white) !important;
}
</style>
