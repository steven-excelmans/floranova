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

    <!-- Sun filter + stock toggle -->
    <div class="filter-secondary">
      <div class="sun-filter">
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
      </div>

      <div class="filter-divider" />

      <StockToggle
        :in-stock="stockOnly"
        @toggle="onStockUpdate"
      />
    </div>

    <!-- Bottom divider -->
    <div class="header-divider" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PlantType, SunRequirement } from 'src/types/plant';
import StockToggle from './StockToggle.vue';

const props = defineProps<{
  search: string;
  typeFilter: PlantType | null;
  sunFilter: SunRequirement | null;
  stockOnly: boolean;
}>();

const emit = defineEmits<{
  'update:search': [value: string];
  'update:typeFilter': [value: PlantType | null];
  'update:sunFilter': [value: SunRequirement | null];
  'update:stockOnly': [value: boolean];
}>();

const { t } = useI18n();

function onSearchInput(event: Event) {
  emit('update:search', (event.target as HTMLInputElement).value);
}

function onTypeUpdate(val: PlantType | null) {
  emit('update:typeFilter', val);
}

function onSunToggle(val: SunRequirement) {
  // Toggle: clicking the active one deactivates it
  emit('update:sunFilter', props.sunFilter === val ? null : val);
}

function onStockUpdate() {
  emit('update:stockOnly', !props.stockOnly);
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
  padding-bottom: 14px;
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

// ── Sun filter + stock toggle ──
.filter-secondary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 12px;
}

.sun-filter {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sun-btn {
  width: 34px;
  height: 34px;
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

.filter-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  flex-shrink: 0;
}

// ── Bottom header divider ──
.header-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, #E0D9CE 50%, transparent 95%);
}
</style>
