<template>
  <q-page class="garden-page">
    <!-- View toggle -->
    <div class="garden-header">
      <div class="view-toggle">
        <button
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': activeTab === 'plantings' }"
          @click="activeTab = 'plantings'"
        >
          {{ t('garden.myPlantings') }}
        </button>
        <button
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': activeTab === 'upcoming' }"
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

.garden-header {
  background: var(--warm-white);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 10;
}

.view-toggle {
  display: flex;
  background: var(--sand);
  border-radius: var(--radius-pill);
  padding: 3px;
}

.view-toggle__btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 22px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &.view-toggle__btn--active {
    background: var(--warm-white);
    color: var(--deep-brown);
    box-shadow: 0 1px 6px rgba(53, 43, 34, 0.08);
    font-weight: 600;
  }
}

.garden-content {
  padding: 16px 16px 110px;
  flex: 1;
}

/* FAB button */
.garden-fab {
  position: fixed;
  bottom: 82px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
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
