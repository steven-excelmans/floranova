<template>
  <q-page class="dashboard">
    <!-- Stats strip -->
    <div class="stats-strip">
      <div class="stat">
        <span class="stat__num">{{ totalPlants }}</span>
        <span class="stat__label">{{ t('admin.plantsWord') }}</span>
      </div>
      <span class="stats-strip__sep" />
      <div class="stats-strip__breakdown">
        <div class="stat">
          <span class="stat__dot stat__dot--pending" />
          <span class="stat__num">{{ pendingCount }}</span>
          <span class="stat__label">{{ t('admin.pendingPlants') }}</span>
        </div>
        <div class="stat">
          <span class="stat__dot stat__dot--unverified" />
          <span class="stat__num">{{ unverifiedCount }}</span>
          <span class="stat__label">{{ t('admin.unverifiedPlants') }}</span>
        </div>
        <div class="stat">
          <span class="stat__dot stat__dot--verified" />
          <span class="stat__num">{{ verifiedCount }}</span>
          <span class="stat__label">{{ t('admin.verifiedPlants') }}</span>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="actions">
      <span class="actions__title">{{ t('admin.quickActions') }}</span>
      <router-link to="/admin/plants/add-names" class="action">
        <span class="material-icons-outlined action__icon">add_circle</span>
        <span class="action__text">{{ t('admin.addNewPlants') }}</span>
        <span class="material-icons-outlined action__arrow">chevron_right</span>
      </router-link>
      <router-link to="/admin/generate-prompt" class="action">
        <span class="material-icons-outlined action__icon">auto_awesome</span>
        <span class="action__text">{{ t('admin.generatePromptAction') }}</span>
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
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';

const { t } = useI18n();
const plantStore = usePlantStore();

const totalPlants = computed(() => plantStore.plants.length);
const pendingCount = computed(() => plantStore.plants.filter((p) => p.status === 'pending').length);
const unverifiedCount = computed(() => plantStore.plants.filter((p) => p.status === 'unverified').length);
const verifiedCount = computed(() => plantStore.plants.filter((p) => p.status === 'verified').length);
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 12px 16px 80px;
}

// ── Stats strip ──
.stats-strip {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--warm-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.stats-strip__breakdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.stats-strip__sep {
  width: 1px;
  height: 24px;
  background: var(--border-light);
  flex-shrink: 0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;

  &--pending { background: var(--clay); }
  &--unverified { background: var(--cal-indoor); }
  &--verified { background: var(--moss); }
}

.stat__num {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1;
}

.stat__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  line-height: 1;
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
