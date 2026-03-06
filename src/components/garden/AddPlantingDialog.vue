<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="add-dialog" @click.stop>
      <div class="add-dialog__handle" />

      <!-- Plant hero -->
      <div v-if="selectedPlant" class="plant-hero">
        <div class="plant-hero__img">
          <img
            v-if="coverUrl"
            :src="coverUrl"
            :alt="plantDisplayName"
          />
          <span v-else class="material-icons-outlined">{{ plantIcon }}</span>
        </div>
        <div class="plant-hero__info">
          <div class="plant-hero__name">{{ plantDisplayName }}</div>
          <div class="plant-hero__latin">{{ selectedPlant.latinName }}</div>
        </div>
        <div class="plant-hero__type" :class="selectedPlant.type">
          <span class="material-icons-outlined">{{ plantIcon }}</span>
        </div>
      </div>

      <!-- Plant select (when no plant pre-selected) -->
      <div v-else class="add-dialog__field">
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

      <!-- Quick fields -->
      <div class="quick-fields">
        <!-- Date row -->
        <div class="quick-row">
          <div class="quick-row__left">
            <div class="quick-row__icon">
              <span class="material-icons-outlined">event</span>
            </div>
            <div>
              <div class="quick-row__label">{{ isTuber ? t('garden.datePlanted') : t('garden.dateSeeded') }}</div>
              <div class="quick-row__value">{{ formattedDate }}</div>
            </div>
          </div>
          <span class="quick-row__edit">{{ t('garden.edit') }}</span>

          <q-popup-proxy
            anchor="bottom left"
            self="top left"
            transition-show="jump-down"
            transition-hide="jump-up"
            class="date-popup"
          >
            <q-date
              :model-value="qDateValue"
              :locale="qDateLocale"
              minimal
              mask="YYYY-MM-DD"
              class="flora-date"
              @update:model-value="onDatePick"
            />
          </q-popup-proxy>
        </div>

        <!-- Amount row -->
        <div class="quick-row">
          <div class="quick-row__left">
            <div class="quick-row__icon">
              <span class="material-icons-outlined">{{ isTuber ? 'radio_button_checked' : 'grain' }}</span>
            </div>
            <div>
              <div class="quick-row__label">{{ t('garden.amount') }}</div>
              <div class="quick-row__value">{{ form.amount }}</div>
            </div>
          </div>
          <div class="stepper">
            <button class="stepper__btn" :disabled="form.amount <= 1" @click="form.amount--">
              <span class="material-icons-outlined">remove</span>
            </button>
            <button class="stepper__btn" @click="form.amount++">
              <span class="material-icons-outlined">add</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Location -->
      <label class="add-dialog__label">{{ t('garden.location') }}</label>
      <div class="location-strip">
        <button
          v-for="loc in locationOptions"
          :key="loc.value"
          class="loc-pill"
          :class="{ 'loc-pill--active': form.location === loc.value }"
          type="button"
          @click="form.location = loc.value"
        >
          <span class="material-icons-outlined loc-pill__icon">{{ loc.icon }}</span>
          {{ loc.label }}
        </button>
      </div>

      <!-- Notes (collapsible) -->
      <button
        v-if="!showNotes && !form.notes"
        class="notes-toggle"
        type="button"
        @click="showNotes = true"
      >
        <span class="material-icons-outlined">add</span>
        {{ t('garden.addNote') }}
      </button>
      <div v-if="showNotes || form.notes" class="add-dialog__field notes-field">
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
        <button
          class="add-dialog__btn add-dialog__btn--cancel"
          type="button"
          @click="$emit('update:modelValue', false)"
        >
          {{ t('admin.cancel') }}
        </button>
        <button
          class="add-dialog__btn add-dialog__btn--submit"
          type="button"
          :disabled="!form.plantId"
          @click="submit"
        >
          {{ isTuber ? t('garden.plantBtn') : t('garden.sowBtn') }}
          <span class="material-icons-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { usePlantingStore } from 'src/stores/planting-store';
import { useLocale } from 'src/composables/useLocale';
import { getCoverImage } from 'src/types/plant';
import type { PlantingLocation } from 'src/types/planting';

const props = defineProps<{
  modelValue: boolean;
  preSelectedPlantId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const { t, locale } = useI18n();
const plantStore = usePlantStore();
const plantingStore = usePlantingStore();
const { localize } = useLocale();

const today = new Date().toISOString().slice(0, 10);
const showNotes = ref(false);

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
    showNotes.value = false;
  }
});

const selectedPlant = computed(() => plantStore.getPlantById(form.plantId));
const isTuber = computed(() => selectedPlant.value?.propagation === 'tuber');

const plantDisplayName = computed(() => {
  if (!selectedPlant.value) return '';
  const full = localize(selectedPlant.value.name);
  if (selectedPlant.value.variety && full.endsWith(selectedPlant.value.variety)) {
    return full.slice(0, -selectedPlant.value.variety.length).trimEnd();
  }
  return full;
});

const coverUrl = computed(() =>
  selectedPlant.value ? getCoverImage(selectedPlant.value.images)?.url ?? null : null,
);

const plantIconMap: Record<string, string> = {
  flower: 'local_florist',
  herb: 'grass',
  vegetable: 'spa',
};
const plantIcon = computed(() => plantIconMap[selectedPlant.value?.type ?? ''] ?? 'local_florist');

// Format date in Dutch locale
const formattedDate = computed(() => {
  const d = new Date(form.dateSeeded + 'T00:00:00');
  const isToday = form.dateSeeded === today;
  const formatted = d.toLocaleDateString(locale.value === 'nl' ? 'nl-NL' : 'en-US', {
    day: 'numeric',
    month: 'long',
  });
  return isToday ? `${t('garden.today')}, ${formatted}` : formatted;
});

// QDate value — same YYYY-MM-DD format as the mask
const qDateValue = computed(() => form.dateSeeded);

function onDatePick(val: string) {
  form.dateSeeded = val;
}

// Dutch locale for QDate
const qDateLocale = computed(() =>
  locale.value === 'nl'
    ? {
        days: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
        daysShort: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
        months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
        firstDayOfWeek: 1,
      }
    : undefined,
);

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

const locationOptions: { label: string; value: PlantingLocation; icon: string }[] = [
  { label: t('garden.indoor'), value: 'indoor', icon: 'home' },
  { label: t('garden.cold-greenhouse'), value: 'cold-greenhouse', icon: 'warehouse' },
  { label: t('garden.outdoor'), value: 'outdoor', icon: 'park' },
];

function submit() {
  void plantingStore.addPlanting({
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
  margin: 0 auto 16px;
}

/* ── Plant hero ── */
.plant-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--sand);
  border-radius: var(--radius-md);
  margin-bottom: 20px;

  &__img {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--border-light);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .material-icons-outlined {
      font-size: 24px;
      color: var(--muted);
      opacity: 0.4;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--deep-brown);
    line-height: 1.2;
  }

  &__latin {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--muted);
    font-style: italic;
    margin-top: 1px;
  }

  &__type {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .material-icons-outlined { font-size: 16px; }

    &.flower { background: var(--flower-bg); color: var(--flower); }
    &.herb { background: var(--herb-bg); color: var(--herb); }
    &.vegetable { background: var(--veg-bg); color: var(--veg); }
  }
}

/* ── Quick fields ── */
.quick-fields {
  margin-bottom: 20px;
}

.quick-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  position: relative;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: rgba(245, 240, 232, 0.5);
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--sand);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .material-icons-outlined {
      font-size: 18px;
      color: var(--clay);
    }
  }

  &__label {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    color: var(--muted-light);
    letter-spacing: 0.2px;
  }

  &__value {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--deep-brown);
    line-height: 1.25;
  }

  &__edit {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    color: var(--moss);
    letter-spacing: 0.1px;
    align-self: center;
  }
}

/* ── Stepper ── */
.stepper {
  display: flex;
  align-items: center;
  gap: 6px;

  &__btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--warm-white);
    border: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 0;

    .material-icons-outlined {
      font-size: 16px;
      color: var(--deep-brown);
    }

    &:hover:not(:disabled) {
      border-color: var(--moss);
      background: var(--moss-pale);

      .material-icons-outlined {
        color: var(--moss);
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.92);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }
}

/* ── Location strip ── */
.location-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  margin-bottom: 18px;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.loc-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: var(--radius-pill);
  border: none;
  background: var(--sand);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &__icon {
    font-size: 15px !important;
  }

  &:hover {
    color: var(--deep-brown);
    background: #EBE6DD;
  }

  &--active {
    background: var(--moss);
    color: #fff;

    .loc-pill__icon {
      color: #fff !important;
    }

    &:hover {
      background: var(--moss-light);
      color: #fff;
    }
  }
}

/* ── Notes toggle ── */
.notes-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--moss);
  cursor: pointer;
  margin-bottom: 18px;
  transition: opacity 0.15s;

  .material-icons-outlined {
    font-size: 16px;
  }

  &:hover {
    opacity: 0.75;
  }
}

.notes-field {
  margin-bottom: 4px;
}

/* ── Shared form styles ── */
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
  margin-bottom: 8px;
}

/* Override Quasar input styles */
.add-dialog__select-input,
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
    min-height: 72px;
    align-items: flex-start;
    padding: 0 16px;
  }

  :deep(.q-field__native) {
    padding: 11px 0;
    height: 80px;
    min-height: 80px;
    max-height: 80px;
    overflow-y: auto;
    resize: none;
    line-height: 1.5;
  }
}

/* ── Actions ── */
.add-dialog__actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.add-dialog__btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &--cancel {
    background: var(--sand);
    color: var(--muted);

    &:hover:not(:disabled) {
      background: #EBE6DD;
      color: var(--deep-brown);
    }
  }

  &--submit {
    background: var(--moss);
    color: #fff;

    .material-icons-outlined {
      font-size: 18px;
      transition: transform 0.2s ease;
    }

    &:hover:not(:disabled) {
      background: var(--moss-light);
      box-shadow: 0 4px 12px rgba(92, 107, 78, 0.3);

      .material-icons-outlined {
        transform: translateX(2px);
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
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

/* QDate popup — fit wrapper to calendar */
.date-popup.q-menu {
  min-width: 0 !important;
  width: auto !important;
  border-radius: var(--radius-md) !important;
  box-shadow: 0 8px 32px rgba(53, 43, 34, 0.14), 0 2px 8px rgba(53, 43, 34, 0.06) !important;
  overflow: hidden;
}

/* Organic-themed QDate */
.flora-date.q-date {
  width: 270px !important;
  min-width: 270px !important;
  background: var(--warm-white) !important;
  border-radius: var(--radius-md);
  font-family: var(--font-body);

  /* Navigation header (month + year arrows) */
  .q-date__navigation {
    padding: 8px 4px 4px;
  }

  .q-date__arrow {
    color: var(--clay) !important;
    transition: color 0.15s;

    &:hover {
      color: var(--moss) !important;
    }
  }

  /* Month/year labels */
  .q-btn__content {
    font-family: var(--font-display);
    font-weight: 600;
    color: var(--deep-brown);
  }

  /* Day-of-week headers */
  .q-date__calendar-weekdays > div {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    color: var(--muted-light) !important;
  }

  /* Day buttons */
  .q-date__calendar-item .q-btn {
    font-family: var(--font-body);
    font-weight: 500;
    color: var(--deep-brown);

    &:hover {
      background: var(--sand) !important;
    }
  }

  /* Today indicator */
  .q-date__today {
    border-color: var(--clay-light) !important;
  }

  /* Selected day */
  .q-date__calendar-item .q-btn.bg-primary {
    background: var(--moss) !important;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(92, 107, 78, 0.3);

    .q-btn__content {
      color: #fff !important;
    }
  }

  /* Days outside current month */
  .q-date__calendar-item--out {
    opacity: 0.3;
  }
}
</style>
