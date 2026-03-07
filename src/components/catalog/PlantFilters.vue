<template>
  <div class="plant-filters">
    <!-- Search bar -->
    <div class="search-area">
      <div class="search-wrap">
        <span class="material-icons-outlined search-icon">search</span>
        <input
          type="text"
          class="search-input"
          :placeholder="t('catalog.searchPlaceholder')"
          :value="search"
          @input="onSearchInput"
        />
        <button
          v-if="search"
          class="search-clear"
          @click="$emit('update:search', '')"
        >
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
    </div>

    <!-- Type filter chips -->
    <div class="filter-area">
      <div class="filter-row">
        <button
          class="filter-chip"
          :class="{ active: typeFilter === null }"
          @click="onTypeUpdate(null)"
        >
          {{ t('catalog.allTypes') }}
        </button>
        <button
          class="filter-chip"
          :class="{ active: typeFilter === 'flower' }"
          @click="onTypeUpdate('flower')"
        >
          <span class="chip-dot" style="background: var(--flower);" />
          {{ t('catalog.flowers') }}
        </button>
        <button
          class="filter-chip"
          :class="{ active: typeFilter === 'herb' }"
          @click="onTypeUpdate('herb')"
        >
          <span class="chip-dot" style="background: var(--herb);" />
          {{ t('catalog.herbs') }}
        </button>
        <button
          class="filter-chip"
          :class="{ active: typeFilter === 'vegetable' }"
          @click="onTypeUpdate('vegetable')"
        >
          <span class="chip-dot" style="background: var(--veg);" />
          {{ t('catalog.vegetables') }}
        </button>
      </div>
    </div>

    <!-- Expand trigger -->
    <button class="expand-trigger" @click="expanded = !expanded">
      <span class="trigger-content">
        {{ t('catalog.moreFilters') }}
        <span v-if="activeSecondaryCount > 0" class="active-badge">{{ activeSecondaryCount }}</span>
        <span class="material-icons-outlined" :class="{ rotated: expanded }">expand_more</span>
      </span>
    </button>

    <!-- Expandable tray -->
    <div class="tray" :class="expanded ? 'expanded' : 'collapsed'">
      <div class="tray-inner">
        <!-- Sunlight + Propagation (same row) -->
        <div class="filter-row-split">
          <div class="filter-group">
            <span class="filter-group__title">{{ t('plant.exposure') }}</span>
            <div class="filter-group__row">
              <button
                class="sun-btn"
                :class="{ active: sunFilter === 'full-sun' }"
                :title="t('catalog.fullSun')"
                @click="onSunToggle('full-sun')"
              >
                <span class="material-icons-outlined">light_mode</span>
              </button>
              <button
                class="sun-btn"
                :class="{ active: sunFilter === 'partial-shade' }"
                :title="t('catalog.partialShade')"
                @click="onSunToggle('partial-shade')"
              >
                <span class="material-icons-outlined">contrast</span>
              </button>
              <button
                class="sun-btn"
                :class="{ active: sunFilter === 'shade' }"
                :title="t('catalog.shade')"
                @click="onSunToggle('shade')"
              >
                <span class="material-icons-outlined">wb_cloudy</span>
              </button>
            </div>
          </div>

          <div class="filter-group filter-group--right">
            <span class="filter-group__title">{{ t('plant.propagation') }}</span>
            <div class="filter-group__row">
              <button
                class="prop-icon-btn"
                :class="{ active: propagationFilter === 'seed' }"
                :title="t('catalog.seed')"
                @click="onPropagationToggle('seed')"
              >
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C8 1 5 5 5 9c0 1.66 1.34 3 3 3s3-1.34 3-3C11 5 8 1 8 1z"/><path d="M8 5.5v4" stroke="white" stroke-width="0.8" fill="none" opacity="0.4"/></svg>
              </button>
              <button
                class="prop-icon-btn"
                :class="{ active: propagationFilter === 'tuber' }"
                :title="t('catalog.tuber')"
                @click="onPropagationToggle('tuber')"
              >
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5C6.5 3.5 4 6 4 9c0 2.2 1.8 3.5 4 3.5s4-1.3 4-3.5c0-3-2.5-5.5-4-5.5z"/><path d="M8 5.5c-.8 1.2-1.2 2.5-1.2 3.8" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/><path d="M7.2 3.8C7 2.8 7.3 1.5 8 1c.7.5 1 1.8.8 2.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 12.5c.2.5.2 1 .1 1.3M8 12.5v1.3M9.5 12.5c-.2.5-.2 1-.1 1.3" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Stock + Germination toggles -->
        <div class="filter-row-split">
          <div class="filter-group">
            <span class="filter-group__title">{{ t('catalog.availability') }}</span>
            <StockToggle
              :in-stock="stockOnly"
              @toggle="onStockUpdate"
            />
          </div>
          <div class="filter-group filter-group--right">
            <span class="filter-group__title">{{ t('plant.germination') }}</span>
            <GerminationToggle
              :show="showGermination"
              @toggle="onGerminationUpdate"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom divider -->
    <div class="header-divider" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PlantType, SunRequirement, PropagationType } from 'src/types/plant';
import StockToggle from './StockToggle.vue';
import GerminationToggle from './GerminationToggle.vue';

const props = defineProps<{
  search: string;
  typeFilter: PlantType | null;
  sunFilter: SunRequirement | null;
  propagationFilter: PropagationType | null;
  stockOnly: boolean;
  showGermination: boolean;
}>();

const emit = defineEmits<{
  'update:search': [value: string];
  'update:typeFilter': [value: PlantType | null];
  'update:sunFilter': [value: SunRequirement | null];
  'update:propagationFilter': [value: PropagationType | null];
  'update:stockOnly': [value: boolean];
  'update:showGermination': [value: boolean];
}>();

const { t } = useI18n();
const expanded = ref(false);

const activeSecondaryCount = computed(() => {
  let count = 0;
  if (props.sunFilter) count++;
  if (props.propagationFilter) count++;
  if (props.stockOnly) count++;
  return count;
});

function onSearchInput(event: Event) {
  emit('update:search', (event.target as HTMLInputElement).value);
}

function onTypeUpdate(val: PlantType | null) {
  emit('update:typeFilter', val);
}

function onSunToggle(val: SunRequirement) {
  emit('update:sunFilter', props.sunFilter === val ? null : val);
}

function onPropagationToggle(val: PropagationType) {
  emit('update:propagationFilter', props.propagationFilter === val ? null : val);
}

function onStockUpdate() {
  emit('update:stockOnly', !props.stockOnly);
}

function onGerminationUpdate() {
  emit('update:showGermination', !props.showGermination);
}
</script>

<style scoped lang="scss">
.plant-filters {
  display: flex;
  flex-direction: column;
}

// ── Search ──
.search-area {
  padding: 0 20px 14px;
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--muted-light);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 46px;
  border: none;
  background: var(--sand);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--deep-brown);
  outline: none;
  transition: box-shadow 0.3s ease, background 0.3s ease;

  &:focus {
    background: #F0EBE1;
    box-shadow: 0 0 0 2px rgba(92, 107, 78, 0.15);
  }

  &::placeholder {
    color: var(--muted-light);
    font-weight: 400;
  }
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.2s ease;

  .material-icons-outlined {
    font-size: 14px;
    color: var(--muted);
  }

  &:hover {
    background: var(--muted-light);

    .material-icons-outlined {
      color: var(--warm-white);
    }
  }
}

// ── Type filter chips ──
.filter-area {
  padding: 0 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  background: transparent;
  border: 1.5px solid var(--border);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
  flex-shrink: 0;
  line-height: 1;
  user-select: none;

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }

  &.active {
    background: var(--deep-brown);
    color: var(--warm-white);
    border-color: var(--deep-brown);

    .chip-dot {
      box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.4);
    }
  }
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ── Expand trigger ──
.expand-trigger {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  padding: 8px 20px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.25s ease;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-light);
  }

  &:hover {
    color: var(--deep-brown);
  }
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  flex-shrink: 0;
}

.trigger-content .material-icons-outlined {
  font-size: 15px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.rotated {
    transform: rotate(180deg);
  }
}

.active-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  padding: 0 4px;
  background: var(--clay);
  color: white;
  font-size: 9px;
  font-weight: 700;
}

// ── Expandable tray ──
.tray {
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.tray.collapsed {
  max-height: 0;
  opacity: 0;
}

.tray.expanded {
  max-height: 300px;
  opacity: 1;
}

.tray-inner {
  padding: 6px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── Split row (sunlight left, propagation right) ──
.filter-row-split {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

// ── Filter group with title ──
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group--right {
  align-items: flex-end;
}

.filter-group__title {
  font-size: 10px;
  font-weight: 600;
  color: var(--muted-light);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.filter-group__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

// ── Sun buttons ──
.sun-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  color: var(--muted);

  .material-icons-outlined {
    font-size: 17px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }

  &.active {
    background: var(--moss);
    border-color: var(--moss);
    color: var(--warm-white);
  }
}

// ── Propagation icon buttons ──
.prop-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  color: var(--muted);

  svg {
    width: 17px;
    height: 17px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }

  &.active {
    background: var(--deep-brown);
    border-color: var(--deep-brown);
    color: var(--warm-white);
  }
}

// ── Bottom header divider ──
.header-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, #E0D9CE 50%, transparent 95%);
}
</style>
