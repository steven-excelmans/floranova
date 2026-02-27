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
  <q-page v-else class="detail-page">

    <!-- ── 1. HERO ── -->
    <div class="hero">
      <!-- Image or gradient placeholder -->
      <div class="hero__media">
        <img
          v-if="currentImage"
          :src="currentImage"
          :alt="displayName"
          class="hero__img"
        />
        <div v-else class="hero__placeholder">
          <span class="material-icons-outlined hero__placeholder-icon">local_florist</span>
        </div>
      </div>

      <!-- Back button -->
      <button class="hero__back" @click="router.back()">
        <span class="material-icons-outlined">arrow_back</span>
      </button>

      <!-- Image dots (only when multiple images) -->
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

    <!-- ── 2. CONTENT CARD ── -->
    <div class="content">
      <div class="content__card">

        <!-- ── 2a. HEADER ── -->
        <div class="header">
          <div class="header__top">
            <h1 class="header__name">{{ displayName }}</h1>
            <PlantTypeBadge :type="plant.type" class="header__badge" />
          </div>
          <p class="header__latin">{{ plant.latinName }}</p>
          <span v-if="!plant.verified" class="header__verification">
            <span class="material-icons-outlined">info</span>
            {{ t('plant.notVerified') }}
          </span>
        </div>

        <!-- ── 2b. ACTIONS ── -->
        <div class="actions">
          <button
            class="btn btn--stock"
            :class="{ 'btn--stock-active': stockStore.isInStock(plant.id) }"
            @click="stockStore.toggleStock(plant.id)"
          >
            <span class="material-icons-outlined">{{ stockStore.isInStock(plant.id) ? 'inventory_2' : 'add_box' }}</span>
            {{ stockStore.isInStock(plant.id) ? t('stock.inStock') : t('stock.notInStock') }}
          </button>

          <button class="btn btn--plant" @click="showAddPlanting = true">
            <span class="material-icons-outlined">yard</span>
            {{ t('plant.plantThis') }}
          </button>
        </div>

        <div class="divider" />

        <!-- ── 2c. CALENDAR ── -->
        <div class="section">
          <h2 class="section__title">{{ t('plant.calendar') }}</h2>

          <!-- Month labels -->
          <div class="cal-months">
            <span
              v-for="m in 12"
              :key="m"
              class="cal-months__label"
              :class="{ 'cal-months__label--current': m === currentMonth }"
            >
              {{ shortMonthLabel(m) }}
            </span>
          </div>

          <!-- Indoor sowing row -->
          <div v-if="plant.calendar.indoorSowing" class="cal-row">
            <div class="cal-row__label">{{ t('calendar.indoorSowing') }}</div>
            <MonthRangeBar :range="plant.calendar.indoorSowing" action="indoorSowing" />
          </div>

          <!-- Greenhouse row -->
          <div v-if="plant.calendar.greenhouse" class="cal-row">
            <div class="cal-row__label">{{ t('calendar.greenhouse') }}</div>
            <MonthRangeBar :range="plant.calendar.greenhouse" action="greenhouse" />
          </div>

          <!-- Cold greenhouse row -->
          <div v-if="plant.calendar.coldGreenhouse" class="cal-row">
            <div class="cal-row__label">{{ t('calendar.coldGreenhouse') }}</div>
            <MonthRangeBar :range="plant.calendar.coldGreenhouse" action="coldGreenhouse" />
          </div>

          <!-- Outdoor row -->
          <div v-if="plant.calendar.outdoor" class="cal-row">
            <div class="cal-row__label">{{ t('calendar.outdoor') }}</div>
            <MonthRangeBar :range="plant.calendar.outdoor" action="outdoor" />
          </div>

          <!-- Legend -->
          <div class="cal-legend">
            <div v-if="plant.calendar.indoorSowing" class="legend-item">
              <div class="legend-item__bar legend-item__bar--indoor" />
              {{ t('calendar.indoorSowing') }}
            </div>
            <div v-if="plant.calendar.coldGreenhouse || plant.calendar.greenhouse" class="legend-item">
              <div class="legend-item__bar legend-item__bar--cold" />
              {{ t('calendar.coldGreenhouse') }}
            </div>
            <div v-if="plant.calendar.outdoor" class="legend-item">
              <div class="legend-item__bar legend-item__bar--outdoor" />
              {{ t('calendar.outdoor') }}
            </div>
          </div>
        </div>

        <div class="divider" />

        <!-- ── 2d. QUICK FACTS ── -->
        <div class="section">
          <h2 class="section__title">Details</h2>
          <div class="facts">

            <div v-if="plant.heightCm" class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">straighten</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.height') }}</div>
                <div class="fact__value">{{ plant.heightCm.min }}–{{ plant.heightCm.max }} cm</div>
              </div>
            </div>

            <div class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">wb_twilight</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.germination') }}</div>
                <div class="fact__value">{{ t(`plant.${plant.germination}`) }}</div>
              </div>
            </div>

            <div v-if="plant.germinationDays" class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">schedule</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.germinationTime') }}</div>
                <div class="fact__value">{{ plant.germinationDays.min }}–{{ plant.germinationDays.max }} days</div>
              </div>
            </div>

            <div v-if="plant.germinationTempC" class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">thermostat</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.germinationTemp') }}</div>
                <div class="fact__value">{{ plant.germinationTempC.min }}–{{ plant.germinationTempC.max }}°C</div>
              </div>
            </div>

            <div class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">content_cut</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.pinching') }}</div>
                <div class="fact__value">{{ plant.pinching ? t('plant.pinchingYes') : t('plant.pinchingNo') }}</div>
              </div>
            </div>

            <div v-if="plant.seedsPerCell" class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">grass</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.seedsPerCell') }}</div>
                <div class="fact__value">{{ plant.seedsPerCell }} seed{{ plant.seedsPerCell > 1 ? 's' : '' }}</div>
              </div>
            </div>

            <div class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">{{ sunIcon }}</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.sun') }}</div>
                <div class="fact__value">{{ t(`plant.${plant.sun}`) }}</div>
              </div>
            </div>

            <div class="fact">
              <div class="fact__icon">
                <span class="material-icons-outlined">social_distance</span>
              </div>
              <div>
                <div class="fact__label">{{ t('plant.minDistance') }}</div>
                <div class="fact__value">{{ plant.minDistanceCm }} cm</div>
              </div>
            </div>

          </div>
        </div>

        <!-- ── 2e. COLORS ── -->
        <template v-if="plant.colors.length">
          <div class="divider" />
          <div class="section section--compact">
            <h2 class="section__title">{{ t('plant.colors') }}</h2>
            <div class="colors">
              <ColorSquare v-for="color in plant.colors" :key="color.name" :color="color" />
            </div>
          </div>
        </template>

        <!-- ── 2f. POST-GERMINATION CARE ── -->
        <template v-if="plant.careSteps.length">
          <div class="divider" />
          <div class="section">
            <PostGerminationCare :care-steps="plant.careSteps" />
          </div>
        </template>

        <!-- ── 2g. PLANTING CONDITIONS ── -->
        <template v-if="plant.plantingConditions.length">
          <div class="divider" />
          <div class="section section--compact">
            <h2 class="section__title">{{ t('plant.plantingConditions') }}</h2>
            <div class="chips">
              <span
                v-for="cond in plant.plantingConditions"
                :key="cond"
                class="chip"
              >
                {{ t(`plant.${cond}`) }}
              </span>
            </div>
          </div>
        </template>

        <!-- ── 2h. ADDITIONAL TIPS ── -->
        <template v-if="additionalNotes">
          <div class="divider" />
          <div class="section">
            <h2 class="section__title">{{ t('plant.additionalNotes') }}</h2>
            <div class="note-box note-box--moss">
              <p class="note-box__text">{{ additionalNotes }}</p>
            </div>
          </div>
        </template>

        <!-- ── 2i. CUT FLOWER TIPS ── -->
        <template v-if="stemTipsText">
          <div class="divider" />
          <div class="section">
            <h2 class="section__title">{{ t('plant.stemTips') }}</h2>
            <div class="note-box note-box--clay">
              <div class="note-box__label note-box__label--clay">
                <span class="material-icons-outlined">content_cut</span>
                Cut flower
              </div>
              <p class="note-box__text">{{ stemTipsText }}</p>
            </div>
          </div>
        </template>

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
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { useStockStore } from 'src/stores/stock-store';
import { useLocale } from 'src/composables/useLocale';
import PlantTypeBadge from 'src/components/shared/PlantTypeBadge.vue';
import MonthRangeBar from 'src/components/shared/MonthRangeBar.vue';
import ColorSquare from 'src/components/shared/ColorSquare.vue';
import PostGerminationCare from 'src/components/detail/PostGerminationCare.vue';
import AddPlantingDialog from 'src/components/garden/AddPlantingDialog.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();
const { localize } = useLocale();

const plant = computed(() =>
  plantStore.getPlantById(route.params.id as string),
);

const displayName = computed(() =>
  plant.value ? localize(plant.value.name) : '',
);

const imageIndex = ref(0);

const currentImage = computed(() => {
  if (!plant.value?.images.length) return null;
  return plant.value.images[imageIndex.value] ?? plant.value.images[0] ?? null;
});

const showAddPlanting = ref(false);

// Current month (1–12) for calendar highlight
const currentMonth = new Date().getMonth() + 1;

// Short single-letter month labels: J F M A M J J A S O N D
const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
function shortMonthLabel(month: number): string {
  return MONTH_LABELS[month - 1] ?? '';
}

const sunIconMap: Record<string, string> = {
  'full-sun': 'light_mode',
  'partial-shade': 'wb_cloudy',
  shade: 'cloud',
};

const sunIcon = computed(() =>
  plant.value ? (sunIconMap[plant.value.sun] ?? 'light_mode') : 'light_mode',
);

const additionalNotes = computed(() =>
  plant.value ? localize(plant.value.maintenanceNotes) : '',
);

const stemTipsText = computed(() =>
  plant.value?.stemTips ? localize(plant.value.stemTips) : '',
);
</script>

<style scoped lang="scss">
/* ── Page wrapper ── */
.detail-page {
  min-height: 100vh;
  background: var(--sand);
  padding: 0 !important;
}

/* ── Not found ── */
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;

  &__inner {
    text-align: center;
    padding: 24px;
  }

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
   1. HERO
   ══════════════════════════════════════ */
.hero {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.hero__media {
  width: 100%;
  height: 100%;
}

.hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

.hero__back {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--warm-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-button);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 10;

  .material-icons-outlined {
    font-size: 20px;
    color: var(--deep-brown);
  }

  &:active {
    transform: scale(0.92);
    box-shadow: 0 1px 4px rgba(53, 43, 34, 0.08);
  }
}

.hero__dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  align-items: center;
}

.hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(53, 43, 34, 0.18);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &--active {
    width: 20px;
    height: 6px;
    border-radius: 3px;
    background: var(--moss);
  }
}

/* ══════════════════════════════════════
   2. CONTENT CARD
   ══════════════════════════════════════ */
.content {
  position: relative;
  margin-top: -24px;
  z-index: 2;
}

.content__card {
  background: var(--warm-white);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  box-shadow: 0 -4px 24px rgba(53, 43, 34, 0.05);
  padding-bottom: 100px;
}

/* ── Section ── */
.section {
  padding: 20px 24px;

  &--compact {
    padding: 16px 24px;
  }
}

/* ── Gradient divider ── */
.divider {
  height: 1px;
  margin: 0 24px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--border) 15%,
    var(--border) 85%,
    transparent 100%
  );
}

/* ── Section title ── */
.section__title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--deep-brown);
  margin-bottom: 14px;
  letter-spacing: -0.01em;
}

/* ── 2a. Header ── */
.header {
  padding: 24px 24px 0;
}

.header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.header__name {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.header__badge {
  flex-shrink: 0;
  margin-top: 4px;
}

.header__latin {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--muted);
  font-style: italic;
  font-weight: 400;
  margin-bottom: 10px;
}

.header__verification {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--clay);
  background: var(--clay-pale);
  padding: 4px 12px;
  border-radius: var(--radius-pill);

  .material-icons-outlined {
    font-size: 14px;
  }
}

/* ── 2b. Actions ── */
.actions {
  display: flex;
  gap: 10px;
  padding: 16px 24px 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  letter-spacing: 0.01em;

  .material-icons-outlined {
    font-size: 17px;
  }

  &:active {
    transform: scale(0.97);
  }
}

.btn--stock {
  background: var(--moss-ghost);
  border: 1.5px solid var(--moss-pale);
  color: var(--moss);

  &:hover {
    background: var(--moss-pale);
  }

  &-active {
    background: var(--moss-pale);
    border-color: var(--moss);
  }
}

.btn--plant {
  background: var(--moss);
  color: #fff;
  box-shadow: 0 2px 10px rgba(92, 107, 78, 0.25);

  &:hover {
    background: #50603F;
  }

  &:active {
    box-shadow: 0 1px 6px rgba(92, 107, 78, 0.20);
  }
}

/* ── 2c. Calendar ── */
.cal-months {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  margin-left: 96px;
  margin-bottom: 8px;
}

.cal-months__label {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--muted-light);
  text-align: center;
  line-height: 1;

  &--current {
    color: var(--moss);
    font-weight: 700;
  }
}

.cal-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.cal-row__label {
  width: 88px;
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  text-align: right;
  flex-shrink: 0;
  line-height: 1.1;
}

/* MonthRangeBar is rendered as the flex: 1 grid component */
:deep(.month-grid) {
  flex: 1;
}

.cal-legend {
  display: flex;
  gap: 14px;
  margin-top: 10px;
  margin-left: 96px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--muted);
}

.legend-item__bar {
  width: 12px;
  height: 4px;
  border-radius: 2px;

  &--indoor {
    background: var(--cal-indoor);
  }

  &--cold {
    background: var(--cal-cold);
  }

  &--outdoor {
    background: var(--cal-outdoor);
  }
}

/* ── 2d. Quick facts ── */
.facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.fact {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: var(--sand);
  border-radius: var(--radius-md);
}

.fact__icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--moss-pale);

  .material-icons-outlined {
    font-size: 16px;
    color: var(--moss);
  }
}

.fact__label {
  font-size: 10px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.fact__value {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--deep-brown);
  line-height: 1.2;
}

/* ── 2e. Colors ── */
.colors {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* ── 2g. Planting conditions ── */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  font-size: 12.5px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--sand);
  color: var(--ink-soft);
  border: 1px solid var(--border-light);
}

/* ── 2h/2i. Note boxes ── */
.note-box {
  background: var(--sand);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
  }

  &--moss::before {
    background: var(--moss);
  }

  &--clay::before {
    background: var(--clay);
  }
}

.note-box__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 8px;

  .material-icons-outlined {
    font-size: 14px;
  }

  &--clay {
    color: var(--clay);
  }

  &--moss {
    color: var(--moss);
  }
}

.note-box__text {
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--ink-soft);
}
</style>
