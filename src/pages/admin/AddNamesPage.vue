<template>
  <q-page class="add-page">
    <h1 class="add-page__title">{{ t('admin.addPlantNames') }}</h1>
    <p class="add-page__desc">
      {{ t('admin.addPlantNamesDescBefore') }}
      <StatusBadge status="pending" class="add-page__inline-badge" />
      {{ t('admin.addPlantNamesDescAfter') }}
    </p>

    <!-- Section label -->
    <div class="section-label">
      <div class="section-label__icon">
        <span class="material-icons-outlined">edit_note</span>
      </div>
      <span class="section-label__text">{{ t('admin.newPlants') }}</span>
      <span class="section-label__line" />
    </div>

    <!-- Add button (top) -->
    <button class="add-btn" @click="addRow">
      <span class="material-icons-outlined">add</span>
      {{ t('admin.addAnother') }}
    </button>

    <!-- Input cards -->
    <div class="input-cards">
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="input-card"
      >
        <button class="input-card__remove" @click="removeRow(index)">
          <span class="material-icons-outlined">close</span>
        </button>
        <div class="input-card__fields">
          <div class="field">
            <span class="field__label">
              {{ t('admin.speciesLabel') }}
              <span class="field__required">*</span>
            </span>
            <input
              v-model="row.species"
              type="text"
              class="field__input"
              :class="{ 'field__input--filled': row.species.trim() }"
              :placeholder="t('admin.speciesPlaceholder')"
            />
          </div>
          <div class="field">
            <span class="field__label">
              {{ t('admin.cultivarLabel') }}
              <span class="field__optional">{{ t('admin.cultivarOptional') }}</span>
            </span>
            <input
              v-model="row.variety"
              type="text"
              class="field__input"
              :class="{ 'field__input--filled': row.variety.trim() }"
              :placeholder="t('admin.varietyOptional')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Save button -->
    <button class="save-btn" :disabled="!hasValidRows" @click="saveAll">
      <span class="material-icons-outlined">check_circle</span>
      {{ t('admin.save') }}
      <span v-if="validRowCount > 0" class="save-btn__count">
        {{ validRowCount }} {{ validRowCount !== 1 ? t('admin.plantsWord') : t('admin.plant') }}
      </span>
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

interface NameRow {
  species: string;
  variety: string;
}

const rows = ref<NameRow[]>([{ species: '', variety: '' }]);

const selectedIds = ref(new Set<string>());

const pendingPlants = computed(() =>
  plantStore.plants.filter((p) => p.status === 'pending'),
);

const allSelected = computed(
  () => pendingPlants.value.length > 0 && pendingPlants.value.every((p) => selectedIds.value.has(p.id)),
);

const hasSelection = computed(() => selectedIds.value.size > 0);

const validRows = computed(() => rows.value.filter((r) => r.species.trim()));
const validRowCount = computed(() => validRows.value.length);
const hasValidRows = computed(() => validRowCount.value > 0);

function addRow() {
  rows.value.unshift({ species: '', variety: '' });
}

function removeRow(index: number) {
  if (rows.value.length > 1) {
    rows.value.splice(index, 1);
  } else {
    rows.value[0] = { species: '', variety: '' };
  }
}

function generateId(species: string, variety: string): string {
  const parts = [species, variety].filter(Boolean).join(' ');
  return parts.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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

async function saveAll() {
  let saved = 0;
  for (const row of validRows.value) {
    const species = row.species.trim();
    const variety = row.variety.trim() || null;
    const id = generateId(species, variety ?? '');

    const plant: Plant = {
      id,
      species,
      variety,
      latinName: species,
      name: { nl: species + (variety ? ` ${variety}` : ''), en: species + (variety ? ` ${variety}` : '') },
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
    saved++;
  }

  $q.notify({ type: 'positive', message: t('admin.savedPending', { count: saved }) });
  rows.value = [{ species: '', variety: '' }];
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

// ── Section label ──
.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--moss-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--moss);

    .material-icons-outlined {
      font-size: 17px;
    }
  }

  &__text {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--deep-brown);
  }

  &__line {
    flex: 1;
    height: 1px;
    background: var(--border-light);
  }
}

// ── Add button ──
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 10px;
  transition: all 0.2s ease;

  .material-icons-outlined {
    font-size: 18px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--clay);
    background: rgba(184, 136, 110, 0.03);
  }
}

// ── Input cards ──
.input-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.input-card {
  background: var(--warm-white);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: var(--shadow-soft);
  position: relative;
  border: 1.5px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: var(--clay-light);
    box-shadow: var(--shadow-card);
  }

  &__remove {
    position: absolute;
    top: 10px;
    right: 10px;
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
      font-size: 18px;
    }

    &:hover {
      background: rgba(194, 91, 78, 0.08);
      color: var(--overdue);
    }
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 28px;
  }
}

// ── Field ──
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;

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

  &__optional {
    font-size: 10px;
    font-weight: 500;
    color: var(--muted-light);
    font-style: italic;
    text-transform: none;
    letter-spacing: 0;
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
      font-style: italic;
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

  &__count {
    background: rgba(255, 255, 255, 0.2);
    padding: 1px 10px;
    border-radius: var(--radius-pill);
    font-size: 13px;
    font-weight: 700;
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
