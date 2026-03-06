<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    :seamless="false"
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="sheet">
      <div class="sheet__handle">
        <div class="sheet__handle-bar" />
      </div>

      <div class="sheet__header">
        <div class="sheet__header-text">
          <h2 class="sheet__title">{{ t('admin.addPlantNames') }}</h2>
          <p class="sheet__subtitle">{{ t('admin.addPlantNamesSheetDesc') }}</p>
        </div>
        <button class="sheet__close" @click="$emit('update:modelValue', false)">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>

      <div class="sheet__body">
        <!-- Add another plant -->
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
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { createPlant } from 'src/services/plant-service';
import type { Plant } from 'src/types/plant';

defineProps<{ modelValue: boolean }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();

const $q = useQuasar();
const { t } = useI18n();

interface NameRow {
  species: string;
  variety: string;
}

const rows = ref<NameRow[]>([{ species: '', variety: '' }]);

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
.sheet {
  background: var(--sand);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.sheet__handle {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
  flex-shrink: 0;
}

.sheet__handle-bar {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
}

.sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 20px 16px;
  flex-shrink: 0;
}

.sheet__header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sheet__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1.2;
}

.sheet__subtitle {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
}

.sheet__close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--border-light);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-top: 2px;

  .material-icons-outlined {
    font-size: 18px;
  }

  &:hover {
    background: var(--border);
    color: var(--deep-brown);
  }
}

.sheet__body {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
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
</style>
