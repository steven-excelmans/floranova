<template>
  <q-page class="plants-page">
    <!-- Search + Add -->
    <div class="toolbar">
      <div class="search-bar">
        <span class="material-icons-outlined search-bar__icon">search</span>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('admin.searchPlants')"
          class="search-bar__input"
        />
        <button v-if="searchQuery" class="search-bar__clear" @click="searchQuery = ''">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
      <router-link to="/admin/plants/add-names" class="btn-add">
        <span class="material-icons-outlined">add</span>
      </router-link>
    </div>

    <!-- Status filters -->
    <div class="status-filters">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        class="status-chip"
        :class="[
          { 'status-chip--active': activeFilter === filter.value },
          filter.value !== 'all' ? `status-chip--${filter.value}` : '',
        ]"
        @click="activeFilter = filter.value"
      >
        <span v-if="filter.value !== 'all'" class="status-chip__dot" />
        <span class="status-chip__label">{{ filter.label }}</span>
        <span class="status-chip__count">{{ filter.count }}</span>
      </button>
    </div>

    <!-- Plant list -->
    <div class="plant-list">
      <div
        v-for="plant in filteredPlants"
        :key="plant.id"
        class="plant-row"
        @click="$router.push(`/admin/plants/${plant.id}`)"
      >
        <div class="type-icon" :class="plant.type">
          <span class="material-icons-outlined">{{ typeIcon(plant.type) }}</span>
        </div>
        <div class="plant-row__info">
          <div class="plant-row__name">
            {{ localize(plant.name) }}
            <span class="status-dot" :class="`status-dot--${plant.status}`" />
          </div>
          <div class="plant-row__sub">
            <span class="plant-row__species">{{ plant.species }}</span>
            <span v-if="plant.variety" class="plant-row__variety">{{ plant.variety }}</span>
          </div>
        </div>
        <button
          v-if="plant.status === 'unverified'"
          class="row-btn row-btn--verify"
          title="Verify"
          @click.stop="verifyPlant(plant.id)"
        >
          <span class="material-icons-outlined">check_circle_outline</span>
        </button>
        <button
          class="row-btn row-btn--delete"
          title="Delete"
          @click.stop="plantToDelete = plant"
        >
          <span class="material-icons-outlined">delete_outline</span>
        </button>
      </div>

      <div v-if="filteredPlants.length === 0" class="empty-state">
        <span class="material-icons-outlined empty-state__icon">search_off</span>
        <p>{{ t('admin.noResults') }}</p>
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    <q-dialog v-model="deleteDialogOpen" persistent>
      <div class="delete-dialog">
        <div class="delete-dialog__icon-wrap">
          <span class="material-icons-outlined">delete_outline</span>
        </div>
        <div class="delete-dialog__title">{{ t('admin.deletePlant') }}</div>
        <div class="delete-dialog__text">
          <strong>{{ plantToDelete?.species }}</strong>
          <span v-if="plantToDelete?.variety"> '{{ plantToDelete.variety }}'</span>
          {{ t('admin.deleteMessage') }}
        </div>
        <div class="delete-dialog__actions">
          <button class="delete-dialog__btn delete-dialog__btn--cancel" @click="plantToDelete = null">
            {{ t('admin.cancel') }}
          </button>
          <button class="delete-dialog__btn delete-dialog__btn--confirm" @click="executeDelete">
            {{ t('admin.delete') }}
          </button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { updatePlantStatus, deletePlant } from 'src/services/plant-service';
import { useLocale } from 'src/composables/useLocale';
import type { Plant, PlantStatus } from 'src/types/plant';

const $q = useQuasar();
const { t } = useI18n();
const plantStore = usePlantStore();
const { localize } = useLocale();

const searchQuery = ref('');
const activeFilter = ref<PlantStatus | 'all'>('all');
const plantToDelete = ref<Plant | null>(null);

const deleteDialogOpen = computed({
  get: () => plantToDelete.value !== null,
  set: (val: boolean) => { if (!val) plantToDelete.value = null; },
});

const typeIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};

function typeIcon(type: string) {
  return typeIconMap[type] ?? 'local_florist';
}

const statusFilters = computed(() => [
  { value: 'all' as const, label: t('admin.all'), count: plantStore.plants.length },
  { value: 'pending' as const, label: t('admin.pendingPlants'), count: plantStore.plants.filter((p) => p.status === 'pending').length },
  { value: 'unverified' as const, label: t('admin.unverifiedPlants'), count: plantStore.plants.filter((p) => p.status === 'unverified').length },
  { value: 'verified' as const, label: t('admin.verifiedPlants'), count: plantStore.plants.filter((p) => p.status === 'verified').length },
]);

const filteredPlants = computed(() => {
  return plantStore.plants
    .filter((plant) => {
      if (activeFilter.value !== 'all' && plant.status !== activeFilter.value) return false;
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        return (
          plant.species.toLowerCase().includes(q) ||
          (plant.variety?.toLowerCase().includes(q) ?? false) ||
          plant.name.nl.toLowerCase().includes(q) ||
          plant.name.en.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => a.species.localeCompare(b.species));
});


async function verifyPlant(id: string) {
  await updatePlantStatus(id, 'verified');
  $q.notify({ type: 'positive', message: t('admin.plantVerified') });
}

async function executeDelete() {
  if (!plantToDelete.value) return;
  const plant = plantToDelete.value;
  plantToDelete.value = null;
  await deletePlant(plant.id);
  $q.notify({ type: 'positive', message: t('admin.plantDeleted') });
}
</script>

<style lang="scss" scoped>
.plants-page {
  padding: 12px 16px 80px;
}

// ── Toolbar ──
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  background: var(--warm-white);
  border-radius: var(--radius-pill);
  padding: 0 14px;
  transition: box-shadow 0.2s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(92, 107, 78, 0.15);
  }

  &__icon {
    font-size: 18px;
    color: var(--muted-light);
  }

  &__input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--deep-brown);
    padding: 10px 0;
  }

  &__clear {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    display: flex;
    padding: 2px;

    .material-icons-outlined {
      font-size: 16px;
    }
  }
}

.btn-add {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--moss);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.2s ease;

  .material-icons-outlined {
    font-size: 20px;
  }

  &:hover {
    opacity: 0.85;
  }
}

// ── Status filter chips (with colored dots) ──
.status-filters {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: var(--warm-white);
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &--pending .status-chip__dot { background: var(--clay); }
  &--unverified .status-chip__dot { background: var(--cal-indoor); }
  &--verified .status-chip__dot { background: var(--moss); }

  &--active {
    background: var(--deep-brown);
    color: var(--warm-white);

    .status-chip__count {
      background: rgba(255, 255, 255, 0.2);
      color: var(--warm-white);
    }
  }

  // Active state preserves the dot color (bright on dark background)
  &--active.status-chip--pending .status-chip__dot { background: var(--clay-light); }
  &--active.status-chip--unverified .status-chip__dot { background: #9DBDD0; }
  &--active.status-chip--verified .status-chip__dot { background: #8DA67E; }

  &__label {
    line-height: 1;
  }

  &__count {
    font-size: 10px;
    font-weight: 600;
    background: var(--sand);
    color: var(--muted);
    padding: 1px 6px;
    border-radius: var(--radius-pill);
    line-height: 1.4;
    transition: all 0.2s ease;
  }
}

// ── Plant list ──
.plant-list {
  display: flex;
  flex-direction: column;
}

.plant-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--warm-white);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;

  & + & {
    margin-top: 2px;
  }

  &:hover {
    background: var(--moss-ghost);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--deep-brown);
    line-height: 1.2;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__sub {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-top: 2px;
  }

  &__species {
    font-size: 11.5px;
    font-style: italic;
    color: var(--muted);
    line-height: 1.2;
  }

  &__variety {
    font-size: 11px;
    color: var(--muted-light);
    line-height: 1.2;

    &::before {
      content: '\00b7';
      margin-right: 4px;
    }
  }

  &__actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }
}

// ── Leading type icon circle ──
.type-icon {
  width: 32px;
  height: 32px;
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

// ── Status dot (inline with name) ──
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;

  &--pending { background: var(--clay); }
  &--unverified { background: var(--cal-indoor); }
  &--verified { background: var(--moss); }
}

// ── Row action buttons ──
.row-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  .material-icons-outlined {
    font-size: 15px;
  }

  &--verify {
    color: var(--muted-light);

    &:hover {
      color: var(--moss);
      background: var(--moss-pale);
    }
  }

  &--delete {
    color: var(--muted-light);

    &:hover {
      color: var(--overdue);
      background: var(--overdue-bg);
    }
  }
}

// ── Delete confirmation dialog ──
.delete-dialog {
  background: var(--warm-white);
  border-radius: var(--radius-card);
  padding: 24px;
  min-width: 280px;
  max-width: 340px;
  text-align: center;
}

.delete-dialog__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--overdue-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;

  .material-icons-outlined {
    font-size: 22px;
    color: var(--overdue);
  }
}

.delete-dialog__title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--deep-brown);
  margin-bottom: 6px;
}

.delete-dialog__text {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 20px;
}

.delete-dialog__actions {
  display: flex;
  gap: 8px;
}

.delete-dialog__btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    opacity: 0.85;
  }

  &--cancel {
    background: var(--sand);
    color: var(--muted);
  }

  &--confirm {
    background: var(--overdue);
    color: #fff;
  }
}

// ── Empty state ──
.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--muted);

  &__icon {
    font-size: 40px;
    color: var(--muted-light);
    display: block;
    margin-bottom: 6px;
  }

  p {
    font-size: 13px;
  }
}
</style>
