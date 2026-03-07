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
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { createPlant } from 'src/services/plant-service';
import type { Plant } from 'src/types/plant';

defineProps<{ modelValue: boolean }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();

const $q = useQuasar();
const { t } = useI18n();

const plantName = ref('');
const inputEl = ref<HTMLInputElement>();

function generateId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
</style>
