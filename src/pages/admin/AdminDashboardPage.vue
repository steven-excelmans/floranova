<template>
  <q-page class="dashboard">
    <!-- Stats card -->
    <div class="stats-card">
      <div class="stats-card__header">
        <span class="stats-card__total">{{ totalPlants }}</span>
        <span class="stats-card__total-label">{{ t('admin.plantsWord') }}</span>
      </div>

      <!-- Progress bar -->
      <div class="progress-bar">
        <div
          v-if="verifiedCount > 0"
          class="progress-bar__seg progress-bar__seg--verified"
          :style="{ width: pct(verifiedCount) }"
        />
        <div
          v-if="unverifiedCount > 0"
          class="progress-bar__seg progress-bar__seg--unverified"
          :style="{ width: pct(unverifiedCount) }"
        />
        <div
          v-if="pendingCount > 0"
          class="progress-bar__seg progress-bar__seg--pending"
          :style="{ width: pct(pendingCount) }"
        />
      </div>

      <!-- Status legend -->
      <div class="legend">
        <div class="legend__item">
          <span class="legend__dot legend__dot--pending" />
          <span class="legend__num">{{ pendingCount }}</span>
          <span class="legend__label">{{ t('admin.pendingPlants') }}</span>
        </div>
        <div class="legend__item">
          <span class="legend__dot legend__dot--unverified" />
          <span class="legend__num">{{ unverifiedCount }}</span>
          <span class="legend__label">{{ t('admin.unverifiedPlants') }}</span>
        </div>
        <div class="legend__item">
          <span class="legend__dot legend__dot--verified" />
          <span class="legend__num">{{ verifiedCount }}</span>
          <span class="legend__label">{{ t('admin.verifiedPlants') }}</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="stats-card__sep" />

      <!-- Type breakdown -->
      <div class="types">
        <div class="types__item">
          <div class="types__icon types__icon--flower">
            <span class="material-icons-outlined">local_florist</span>
          </div>
          <div class="types__info">
            <span class="types__num">{{ flowerCount }}</span>
            <span class="types__label">{{ t('catalog.flowers') }}</span>
          </div>
        </div>
        <div class="types__item">
          <div class="types__icon types__icon--herb">
            <span class="material-icons-outlined">grass</span>
          </div>
          <div class="types__info">
            <span class="types__num">{{ herbCount }}</span>
            <span class="types__label">{{ t('catalog.herbs') }}</span>
          </div>
        </div>
        <div class="types__item">
          <div class="types__icon types__icon--veg">
            <span class="material-icons-outlined">spa</span>
          </div>
          <div class="types__info">
            <span class="types__num">{{ vegCount }}</span>
            <span class="types__label">{{ t('catalog.vegetables') }}</span>
          </div>
        </div>
        <div v-if="tuberCount > 0" class="types__item">
          <div class="types__icon types__icon--tuber">
            <svg viewBox="0 0 16 16" fill="currentColor" style="width: 15px; height: 15px;"><path d="M8 3.5C6.5 3.5 4 6 4 9c0 2.2 1.8 3.5 4 3.5s4-1.3 4-3.5c0-3-2.5-5.5-4-5.5z"/><path d="M8 5.5c-.8 1.2-1.2 2.5-1.2 3.8" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/><path d="M7.2 3.8C7 2.8 7.3 1.5 8 1c.7.5 1 1.8.8 2.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 12.5c.2.5.2 1 .1 1.3M8 12.5v1.3M9.5 12.5c-.2.5-.2 1-.1 1.3" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round"/></svg>
          </div>
          <div class="types__info">
            <span class="types__num">{{ tuberCount }}</span>
            <span class="types__label">{{ t('catalog.tuber') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="actions">
      <span class="actions__title">{{ t('admin.quickActions') }}</span>
      <button class="action" @click="showSheet = true">
        <span class="material-icons-outlined action__icon">add_circle</span>
        <span class="action__text">{{ t('admin.addNewPlants') }}</span>
        <span class="material-icons-outlined action__arrow">chevron_right</span>
      </button>
      <router-link to="/admin/prompt" class="action">
        <span class="material-icons-outlined action__icon">auto_awesome</span>
        <span class="action__text">{{ t('admin.generatePromptAction') }}</span>
        <span class="material-icons-outlined action__arrow">chevron_right</span>
      </router-link>
      <router-link to="/admin/images" class="action">
        <span class="material-icons-outlined action__icon">auto_fix_high</span>
        <span class="action__text">{{ t('admin.imagePromptAction') }}</span>
        <span class="material-icons-outlined action__arrow">chevron_right</span>
      </router-link>
      <router-link to="/admin/import" class="action">
        <span class="material-icons-outlined action__icon">upload</span>
        <span class="action__text">{{ t('admin.importData') }}</span>
        <span class="material-icons-outlined action__arrow">chevron_right</span>
      </router-link>
      <router-link to="/admin/plants" class="action">
        <span class="material-icons-outlined action__icon">list</span>
        <span class="action__text">{{ t('admin.viewAllPlants') }}</span>
        <span class="material-icons-outlined action__arrow">chevron_right</span>
      </router-link>
    </div>

    <!-- Add Plants bottom sheet -->
    <AddPlantsSheet v-model="showSheet" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import AddPlantsSheet from 'src/components/admin/AddPlantsSheet.vue';

const { t } = useI18n();
const plantStore = usePlantStore();
const showSheet = ref(false);

const totalPlants = computed(() => plantStore.plants.length);
const pendingCount = computed(() => plantStore.plants.filter((p) => p.status === 'pending').length);
const unverifiedCount = computed(() => plantStore.plants.filter((p) => p.status === 'unverified').length);
const verifiedCount = computed(() => plantStore.plants.filter((p) => p.status === 'verified').length);

const flowerCount = computed(() => plantStore.plants.filter((p) => p.type === 'flower').length);
const herbCount = computed(() => plantStore.plants.filter((p) => p.type === 'herb').length);
const vegCount = computed(() => plantStore.plants.filter((p) => p.type === 'vegetable').length);
const tuberCount = computed(() => plantStore.plants.filter((p) => p.propagation === 'tuber').length);

function pct(count: number): string {
  if (totalPlants.value === 0) return '0%';
  return `${(count / totalPlants.value) * 100}%`;
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 12px 16px 80px;
}

// ── Stats card ──
.stats-card {
  background: var(--warm-white);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-card);
}

.stats-card__header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 14px;
}

.stats-card__total {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--deep-brown);
  line-height: 1;
}

.stats-card__total-label {
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
}

// ── Progress bar ──
.progress-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  gap: 2px;
  margin-bottom: 12px;
  background: var(--sand);
}

.progress-bar__seg {
  border-radius: 3px;
  transition: width 0.4s ease;

  &--pending { background: var(--clay); }
  &--unverified { background: var(--cal-indoor); }
  &--verified { background: var(--moss); }
}

// ── Status legend ──
.legend {
  display: flex;
  gap: 16px;
}

.legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;

  &--pending { background: var(--clay); }
  &--unverified { background: var(--cal-indoor); }
  &--verified { background: var(--moss); }
}

.legend__num {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1;
}

.legend__label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
}

// ── Divider ──
.stats-card__sep {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--border-light) 15%,
    var(--border-light) 85%,
    transparent 100%
  );
  margin: 14px 0;
}

// ── Type breakdown ──
.types {
  display: flex;
  gap: 0;
}

.types__item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;

  & + & {
    border-left: 1px solid var(--border-light);
    padding-left: 14px;
  }
}

.types__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .material-icons-outlined { font-size: 15px; }

  &--flower { background: var(--flower-bg); color: var(--flower); }
  &--herb { background: var(--herb-bg); color: var(--herb); }
  &--veg { background: var(--veg-bg); color: var(--veg); }
  &--tuber { background: var(--tuber-bg); color: var(--tuber); }
}

.types__info {
  display: flex;
  flex-direction: column;
}

.types__num {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1;
}

.types__label {
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
  margin-top: 2px;
}

// ── Quick actions ──
.actions {
  margin-top: 16px;
}

.actions__title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px 8px;
}

.action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: var(--warm-white);
  border-radius: var(--radius-sm);
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: inherit;
  width: 100%;
  text-align: left;
  transition: background 0.2s ease;

  & + & {
    margin-top: 6px;
  }

  &:hover {
    background: var(--moss-ghost);
  }
}

.action__icon {
  font-size: 18px;
  color: var(--clay);
}

.action__text {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--deep-brown);
}

.action__arrow {
  font-size: 16px;
  color: var(--muted-light);
}
</style>
