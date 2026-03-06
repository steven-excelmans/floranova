<template>
  <q-page class="garden-page">
    <!-- Top bar: toggle + filter (same as calendar) -->
    <div class="top-bar">
      <div class="seg-toggle">
        <button
          class="seg-toggle__btn"
          :class="{ 'seg-toggle__btn--active': activeTab === 'plantings' }"
          @click="activeTab = 'plantings'"
        >
          {{ t('garden.myPlantings') }}
        </button>
        <button
          class="seg-toggle__btn"
          :class="{ 'seg-toggle__btn--active': activeTab === 'upcoming' }"
          @click="activeTab = 'upcoming'"
        >
          {{ t('garden.upcomingActions') }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="garden-content">
      <PlantingList
        v-if="activeTab === 'plantings'"
        :plantings="plantingStore.activePlantings"
        @delete="plantingStore.removePlanting"
        @complete="plantingStore.completeMilestone"
      />

      <UpcomingActions v-else />
    </div>

    <!-- FAB -->
    <button class="garden-fab" aria-label="Add planting" @click="showAddDialog = true">
      <span class="material-icons-outlined">add</span>
    </button>

    <AddPlantingDialog v-model="showAddDialog" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantingStore } from 'src/stores/planting-store';
import PlantingList from 'src/components/garden/PlantingList.vue';
import UpcomingActions from 'src/components/garden/UpcomingActions.vue';
import AddPlantingDialog from 'src/components/garden/AddPlantingDialog.vue';

const { t } = useI18n();
const plantingStore = usePlantingStore();
const activeTab = ref<'plantings' | 'upcoming'>('plantings');
const showAddDialog = ref(false);
</script>

<style lang="scss" scoped>
.garden-page {
  background: var(--sand);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Top bar — matches calendar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  gap: 12px;
}

/* ── Segmented toggle — matches calendar ── */
.seg-toggle {
  display: flex;
  background: var(--border-light);
  border-radius: var(--radius-pill);
  padding: 3px;
  gap: 2px;
}

.seg-toggle__btn {
  padding: 7px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  line-height: 1;

  &--active {
    background: var(--warm-white);
    color: var(--deep-brown);
    font-weight: 600;
    box-shadow: 0 1px 6px rgba(53, 43, 34, 0.08);
  }
}

.garden-content {
  padding: 12px 16px 80px;
  flex: 1;
}

/* FAB button */
.garden-fab {
  position: fixed;
  bottom: 82px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--moss);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 4px 16px rgba(92, 107, 78, 0.35),
    0 1px 4px rgba(92, 107, 78, 0.2);
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s ease;
  z-index: 50;

  .material-icons-outlined {
    font-size: 24px;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow:
      0 6px 24px rgba(92, 107, 78, 0.45),
      0 2px 6px rgba(92, 107, 78, 0.25);
  }

  &:active {
    transform: scale(0.96);
  }
}
</style>
