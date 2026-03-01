<template>
  <q-page class="admin-page">
    <h1 class="admin-page__title">{{ t('admin.addPlantNames') }}</h1>
    <p class="admin-page__desc">{{ t('admin.addPlantNamesDesc') }}</p>

    <!-- Input rows -->
    <div class="name-rows">
      <div v-for="(row, index) in rows" :key="index" class="name-row">
        <input
          v-model="row.species"
          class="name-row__input"
          :placeholder="t('admin.speciesPlaceholder')"
        />
        <input
          v-model="row.variety"
          class="name-row__input name-row__input--variety"
          :placeholder="t('admin.varietyOptional')"
        />
        <button class="name-row__remove" @click="removeRow(index)">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
    </div>

    <button class="add-row-btn" @click="addRow">
      <span class="material-icons-outlined">add</span>
      {{ t('admin.addAnother') }}
    </button>

    <button class="save-btn" :disabled="!hasValidRows" @click="saveAll">
      <span class="material-icons-outlined">save</span>
      {{ t('admin.save') }} {{ validRowCount }} {{ validRowCount !== 1 ? t('admin.plantsWord') : t('admin.plant') }}
    </button>

    <!-- Pending plants list -->
    <template v-if="pendingPlants.length > 0">
      <h2 class="admin-page__subtitle">{{ t('admin.pendingPlantsTitle') }} ({{ pendingPlants.length }})</h2>
      <div class="pending-list">
        <div v-for="plant in pendingPlants" :key="plant.id" class="pending-item">
          <div class="pending-item__info">
            <span class="pending-item__species">{{ plant.species }}</span>
            <span v-if="plant.variety" class="pending-item__variety">'{{ plant.variety }}'</span>
          </div>
          <StatusBadge status="pending" />
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { createPlant } from 'src/services/plant-service';
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

const pendingPlants = computed(() =>
  plantStore.plants.filter((p) => p.status === 'pending'),
);

const validRows = computed(() => rows.value.filter((r) => r.species.trim()));
const validRowCount = computed(() => validRows.value.length);
const hasValidRows = computed(() => validRowCount.value > 0);

function addRow() {
  rows.value.push({ species: '', variety: '' });
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
      calendar: { indoorSowing: null, greenhouse: null, coldGreenhouse: null, outdoor: null },
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
.admin-page {
  padding: 24px 20px 100px;
}

.admin-page__title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--deep-brown);
  margin-bottom: 6px;
}

.admin-page__desc {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 20px;
}

.admin-page__subtitle {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--deep-brown);
  margin: 28px 0 12px;
}

.name-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.name-row {
  display: flex;
  gap: 8px;
  align-items: center;

  &__input {
    flex: 1;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--deep-brown);
    background: var(--warm-white);
    outline: none;

    &:focus {
      border-color: var(--clay-light);
    }

    &--variety {
      flex: 0.8;
    }
  }

  &__remove {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--muted-light);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;

    .material-icons-outlined {
      font-size: 18px;
    }

    &:hover {
      color: var(--overdue);
    }
  }
}

.add-row-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  margin-bottom: 16px;

  .material-icons-outlined {
    font-size: 16px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--clay);
  }
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--moss);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  .material-icons-outlined {
    font-size: 18px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--warm-white);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);

  &__info {
    display: flex;
    gap: 6px;
  }

  &__species {
    font-size: 14px;
    font-weight: 600;
    color: var(--deep-brown);
  }

  &__variety {
    font-size: 14px;
    font-style: italic;
    color: var(--muted);
  }
}
</style>
