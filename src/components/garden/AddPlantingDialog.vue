<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="add-dialog" @click.stop>
      <div class="add-dialog__handle"></div>

      <div class="add-dialog__title">{{ t('garden.addPlanting') }}</div>

      <!-- Plant select -->
      <div class="add-dialog__field">
        <label class="add-dialog__label">{{ t('garden.selectPlant') }}</label>
        <q-select
          v-model="form.plantId"
          :options="plantOptions"
          emit-value
          map-options
          use-input
          input-debounce="0"
          borderless
          :placeholder="t('garden.selectPlant') + '...'"
          class="add-dialog__select-input"
          popup-content-class="add-dialog__popup"
          @filter="filterPlants"
        />
      </div>

      <!-- Date + Amount row -->
      <div class="add-dialog__row">
        <div class="add-dialog__field">
          <label class="add-dialog__label">{{ t('garden.dateSeeded') }}</label>
          <q-input
            v-model="form.dateSeeded"
            type="date"
            borderless
            class="add-dialog__input"
          />
        </div>
        <div class="add-dialog__field">
          <label class="add-dialog__label">{{ t('garden.amount') }}</label>
          <q-input
            v-model.number="form.amount"
            type="number"
            min="1"
            borderless
            class="add-dialog__input"
          />
        </div>
      </div>

      <!-- Location chips -->
      <div class="add-dialog__field">
        <label class="add-dialog__label">{{ t('garden.location') }}</label>
        <div class="location-chips">
          <button
            v-for="loc in locationOptions"
            :key="loc.value"
            class="location-chip"
            :class="{ 'location-chip--active': form.location === loc.value }"
            type="button"
            @click="form.location = loc.value"
          >
            {{ loc.label }}
          </button>
        </div>
      </div>

      <!-- Notes -->
      <div class="add-dialog__field">
        <label class="add-dialog__label">{{ t('garden.notes') }}</label>
        <q-input
          v-model="form.notes"
          type="textarea"
          autogrow
          borderless
          :placeholder="t('garden.notesPlaceholder')"
          class="add-dialog__textarea"
        />
      </div>

      <!-- Actions -->
      <div class="add-dialog__actions">
        <button class="add-dialog__btn add-dialog__btn--cancel" type="button" @click="$emit('update:modelValue', false)">
          {{ t('common.cancel') || 'Cancel' }}
        </button>
        <button
          class="add-dialog__btn add-dialog__btn--submit"
          type="button"
          :disabled="!form.plantId"
          @click="submit"
        >
          {{ t('garden.plant') || t('garden.addPlanting') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { usePlantingStore } from 'src/stores/planting-store';
import { useLocale } from 'src/composables/useLocale';
import type { PlantingLocation } from 'src/types/planting';

const props = defineProps<{
  modelValue: boolean;
  preSelectedPlantId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const { t } = useI18n();
const plantStore = usePlantStore();
const plantingStore = usePlantingStore();
const { localize } = useLocale();

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  plantId: props.preSelectedPlantId ?? '',
  dateSeeded: today,
  amount: 1,
  location: 'indoor' as PlantingLocation,
  notes: '',
});

watch(() => props.preSelectedPlantId, (id) => {
  if (id) form.plantId = id;
});

watch(() => props.modelValue, (open) => {
  if (open) {
    form.plantId = props.preSelectedPlantId ?? '';
    form.dateSeeded = today;
    form.amount = 1;
    form.location = 'indoor';
    form.notes = '';
  }
});

const allPlantOptions = plantStore.plants.map((p) => ({
  label: localize(p.name),
  value: p.id,
}));

const plantOptions = ref(allPlantOptions);

function filterPlants(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    plantOptions.value = allPlantOptions.filter((o) =>
      o.label.toLowerCase().includes(needle),
    );
  });
}

const locationOptions: { label: string; value: PlantingLocation }[] = [
  { label: t('garden.indoor'), value: 'indoor' },
  { label: t('garden.greenhouse'), value: 'greenhouse' },
  { label: t('garden.cold-greenhouse'), value: 'cold-greenhouse' },
  { label: t('garden.outdoor'), value: 'outdoor' },
];

function submit() {
  plantingStore.addPlanting({
    plantId: form.plantId,
    dateSeeded: form.dateSeeded,
    amount: form.amount,
    location: form.location,
    notes: form.notes,
  });
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.add-dialog {
  background: var(--warm-white);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 12px 22px 32px;
}

.add-dialog__handle {
  width: 36px;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin: 0 auto 20px;
}

.add-dialog__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--deep-brown);
  margin-bottom: 22px;
}

.add-dialog__field {
  margin-bottom: 18px;
}

.add-dialog__label {
  display: block;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 7px;
}

.add-dialog__row {
  display: flex;
  gap: 12px;

  .add-dialog__field {
    flex: 1;
  }
}

/* Override Quasar input styles for organic look */
.add-dialog__select-input,
.add-dialog__input,
.add-dialog__textarea {
  :deep(.q-field__control) {
    background: var(--sand);
    border-radius: var(--radius-sm);
    padding: 0 16px;
    height: auto;
    min-height: 44px;

    &::before,
    &::after {
      display: none;
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--deep-brown);
    padding: 11px 0;
  }

  :deep(.q-field__label) {
    display: none;
  }

  :deep(.q-placeholder) {
    color: var(--muted);
    opacity: 0.6;
  }

  &.q-field--focused :deep(.q-field__control) {
    box-shadow: 0 0 0 2px rgba(92, 107, 78, 0.3);
  }
}

.add-dialog__textarea {
  :deep(.q-field__control) {
    min-height: 80px;
    align-items: flex-start;
    padding: 0 16px;
  }

  :deep(.q-field__native) {
    padding: 11px 0;
    min-height: 58px;
    resize: vertical;
    line-height: 1.5;
  }
}

/* Location chips */
.location-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.location-chip {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: none;
  background: var(--sand);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    color: var(--deep-brown);
    background: #EBE6DD;
  }

  &.location-chip--active {
    background: var(--moss);
    color: #fff;

    &:hover {
      background: var(--moss-light);
    }
  }
}

/* Action buttons */
.add-dialog__actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.add-dialog__btn {
  flex: 1;
  padding: 13px;
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.add-dialog__btn--cancel {
    background: var(--sand);
    color: var(--muted);

    &:hover:not(:disabled) {
      background: #EBE6DD;
      color: var(--deep-brown);
    }
  }

  &.add-dialog__btn--submit {
    background: var(--moss);
    color: #fff;

    &:hover:not(:disabled) {
      background: var(--moss-light);
      box-shadow: 0 4px 12px rgba(92, 107, 78, 0.3);
    }
  }
}
</style>

<style lang="scss">
/* Global styles for the q-dialog bottom positioning */
.q-dialog__inner--bottom {
  padding: 0 !important;
  align-items: flex-end;
}

/* Popup content for the plant select dropdown */
.add-dialog__popup {
  font-family: var(--font-body);
  border-radius: var(--radius-md);
  background: var(--warm-white);

  .q-item {
    font-size: 14px;
    color: var(--deep-brown);
  }

  .q-item.q-item--active {
    color: var(--moss);
  }
}
</style>
