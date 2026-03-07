<template>
  <q-page class="add-page">
    <h1 class="add-page__title">{{ t('admin.addPlantNames') }}</h1>
    <p class="add-page__desc">
      {{ t('admin.addPlantNamesDescBefore') }}
      <StatusBadge status="pending" class="add-page__inline-badge" />
      {{ t('admin.addPlantNamesDescAfter') }}
    </p>

    <!-- Input field -->
    <div class="field">
      <span class="field__label">
        {{ t('admin.plantNameLabel') }}
        <span class="field__required">*</span>
      </span>
      <input
        ref="inputEl"
        v-model="plantName"
        type="text"
        class="field__input"
        :class="{ 'field__input--filled': plantName.trim() }"
        :placeholder="t('admin.plantNamePlaceholder')"
        @keyup.enter="save"
      />
      <span class="field__hint">{{ t('admin.plantNameHint') }}</span>
    </div>

    <!-- Save button -->
    <button class="save-btn" :disabled="!plantName.trim()" @click="save">
      <span class="material-icons-outlined">check_circle</span>
      {{ t('admin.save') }}
    </button>

    <!-- Pending plants section -->
    <template v-if="pendingPlants.length > 0">
      <div class="organic-divider" />

      <div class="pending-header">
        <span class="pending-header__title">{{ t('admin.pendingPlantsTitle') }}</span>
        <span class="pending-header__count">{{ pendingPlants.length }}</span>
      </div>

      <!-- Select toolbar -->
      <div class="select-toolbar">
        <div class="select-toolbar__left" @click="toggleAll">
          <div class="select-toolbar__checkbox" :class="{ 'select-toolbar__checkbox--checked': allSelected }">
            <span class="material-icons-outlined">check</span>
          </div>
          <span class="select-toolbar__label">{{ t('admin.selectAllPendingNames') }}</span>
        </div>
        <span class="select-toolbar__info">
          {{ selectedIds.size }} {{ t('admin.ofCount') }} {{ pendingPlants.length }} {{ t('admin.selectedLabel') }}
        </span>
      </div>

      <div class="pending-list">
        <div
          v-for="plant in pendingPlants"
          :key="plant.id"
          class="pending-item"
          :class="{ 'pending-item--selected': selectedIds.has(plant.id) }"
          @click="togglePlant(plant.id)"
        >
          <div class="pending-item__checkbox">
            <span class="material-icons-outlined">check</span>
          </div>
          <div class="pending-item__info">
            <span class="pending-item__species">{{ plant.species }}</span>
            <span v-if="plant.variety" class="pending-item__variety">'{{ plant.variety }}'</span>
          </div>
          <div class="pending-item__actions">
            <StatusBadge status="pending" />
            <button class="pending-item__delete" @click.stop="removePending(plant.id)">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Delete selected button -->
      <button class="delete-selected-btn" :disabled="!hasSelection" @click="deleteSelectedPending">
        <span class="material-icons-outlined">delete_outline</span>
        {{ t('admin.deleteSelected') }}
        <span v-if="hasSelection" class="delete-selected-btn__count">
          {{ selectedIds.size }}
        </span>
      </button>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { createPlant, deletePlant } from 'src/services/plant-service';
import type { Plant } from 'src/types/plant';
import StatusBadge from 'src/components/admin/StatusBadge.vue';

const $q = useQuasar();
const { t } = useI18n();
const plantStore = usePlantStore();

const plantName = ref('');
const inputEl = ref<HTMLInputElement>();

const selectedIds = ref(new Set<string>());

const pendingPlants = computed(() =>
  plantStore.plants.filter((p) => p.status === 'pending'),
);

const allSelected = computed(
  () => pendingPlants.value.length > 0 && pendingPlants.value.every((p) => selectedIds.value.has(p.id)),
);

const hasSelection = computed(() => selectedIds.value.size > 0);

function generateId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(pendingPlants.value.map((p) => p.id));
  }
}

function togglePlant(id: string) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedIds.value = next;
}

async function removePending(id: string) {
  selectedIds.value.delete(id);
  selectedIds.value = new Set(selectedIds.value);
  await deletePlant(id);
}

function deleteSelectedPending() {
  const count = selectedIds.value.size;
  $q.dialog({
    title: t('admin.deleteSelectedTitle'),
    message: t('admin.deleteSelectedMessage', { count }),
    cancel: { flat: true, label: t('admin.cancel'), color: 'grey' },
    ok: { label: t('admin.delete'), color: 'negative' },
    persistent: true,
  }).onOk(() => {
    const ids = [...selectedIds.value];
    selectedIds.value = new Set();
    void Promise.all(ids.map((id) => deletePlant(id))).then(() => {
      $q.notify({ type: 'positive', message: t('admin.deletedSelected', { count: ids.length }) });
    });
  });
}

async function save() {
  const name = plantName.value.trim();
  if (!name) return;

  const id = generateId(name);

  const plant: Plant = {
    id,
    species: name,
    variety: null,
    latinName: name,
    name: { nl: name, en: name },
    type: 'flower',
    lifecycle: 'annual',
    calendar: { indoorSowing: null, coldGreenhouse: null, outdoor: null, harvestPeriod: null },
    germination: 'light',
    colors: [],
    images: [],
    heightCm: null,
    sowingDepthMm: null,
    germinationDays: null,
    germinationTempC: null,
    pinching: false,
    seedsPerCell: null,
    careSteps: [],
    maintenanceNotes: { nl: '', en: '' },
    plantingConditions: [],
    minDistanceCm: 20,
    stemTips: null,
    sun: 'full-sun',
    propagation: 'seed',
    status: 'pending',
  };

  await createPlant(plant);
  $q.notify({ type: 'positive', message: t('admin.savedPending', { count: 1 }) });
  plantName.value = '';
  inputEl.value?.focus();
}
</script>

<style lang="scss" scoped>
.add-page {
  padding: 10px 16px 100px;
}

.add-page__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--deep-brown);
  margin-bottom: 4px;
  line-height: 1.2;
}

.add-page__desc {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 20px;
  line-height: 1.5;
}

.add-page__inline-badge {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 2px;
}

// ── Field ──
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;

  &__hint {
    font-size: 12px;
    color: var(--muted-light);
    line-height: 1.4;
    margin-top: 2px;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--muted);
  }

  &__required {
    color: var(--clay);
  }

  &__input {
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--deep-brown);
    background: var(--warm-white);
    outline: none;
    width: 100%;
    transition: border-color 0.15s ease;

    &:focus {
      border-color: var(--clay-light);
    }

    &::placeholder {
      color: var(--muted-light);
      font-style: italic;
    }

    &--filled {
      font-weight: 500;
    }
  }
}

// ── Save button ──
.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--moss);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-button);

  .material-icons-outlined {
    font-size: 18px;
  }

  &:hover {
    background: var(--moss-light);
    box-shadow: var(--shadow-card);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

}

// ── Divider ──
.organic-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--border) 15%,
    var(--border) 85%,
    transparent 100%
  );
  margin: 24px 0;
}

// ── Pending header ──
.pending-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  &__title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--deep-brown);
  }

  &__count {
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    background: var(--border-light);
    padding: 2px 10px;
    border-radius: var(--radius-pill);
  }
}

// ── Select toolbar ──
.select-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  margin-bottom: 10px;

  &__left {
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    padding: 4px 0;
  }

  &__checkbox {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
    background: var(--warm-white);

    .material-icons-outlined {
      font-size: 11px;
      color: #fff;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    &--checked {
      background: var(--clay);
      border-color: var(--clay);

      .material-icons-outlined {
        opacity: 1;
      }
    }
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
  }

  &__info {
    font-size: 11.5px;
    color: var(--muted-light);
    font-weight: 500;
  }
}

// ── Pending list ──
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--warm-white);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid transparent;

  &--selected {
    border-color: var(--clay-light);
    background: rgba(184, 136, 110, 0.03);
  }

  &__checkbox {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
    background: var(--warm-white);

    .material-icons-outlined {
      font-size: 14px;
      color: #fff;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
  }

  &--selected &__checkbox {
    background: var(--clay);
    border-color: var(--clay);

    .material-icons-outlined {
      opacity: 1;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__species {
    font-size: 13px;
    font-weight: 600;
    color: var(--deep-brown);
    font-style: italic;
  }

  &__variety {
    font-size: 12px;
    color: var(--muted);
  }

  &__delete {
    width: 26px;
    height: 26px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--muted-light);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.15s ease;

    .material-icons-outlined {
      font-size: 16px;
    }

    &:hover {
      background: rgba(194, 91, 78, 0.08);
      color: var(--overdue);
    }
  }
}

// ── Delete selected button ──
.delete-selected-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--overdue);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-button);

  .material-icons-outlined {
    font-size: 18px;
  }

  &:hover {
    opacity: 0.9;
    box-shadow: var(--shadow-card);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &__count {
    background: rgba(255, 255, 255, 0.2);
    padding: 1px 10px;
    border-radius: var(--radius-pill);
    font-size: 13px;
    font-weight: 700;
  }
}
</style>
