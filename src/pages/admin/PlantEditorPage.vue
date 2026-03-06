<template>
  <q-page class="admin-page">
    <!-- Loading / Not found -->
    <div v-if="!plant && !isNew" class="empty-state">
      <span class="material-icons-outlined empty-state__icon">error_outline</span>
      <p>{{ t('admin.plantNotFound') }}</p>
      <router-link to="/admin/plants" class="empty-state__link">{{ t('admin.backToPlants') }}</router-link>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="page-header__left">
          <button class="back-btn" @click="$router.push('/admin/plants')">
            <span class="material-icons-outlined">arrow_back</span>
          </button>
          <h1 class="admin-page__title">{{ isNew ? t('admin.newPlant') : t('admin.editPlant') }}</h1>
        </div>
        <StatusBadge :status="form.status" />
      </div>

      <!-- Form -->
      <div class="editor-form">
        <!-- ── Identity ── -->
        <section class="form-section">
          <h2 class="form-section__title">{{ t('admin.identity') }}</h2>

          <div class="form-grid">
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.species') }}</label>
              <input v-model="form.species" class="form-field__input" :placeholder="t('admin.speciesPlaceholder')" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.variety') }}</label>
              <input v-model="form.variety" class="form-field__input" :placeholder="t('admin.varietyPlaceholder')" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.latinName') }}</label>
              <input v-model="form.latinName" class="form-field__input" :placeholder="t('admin.speciesPlaceholder')" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.type') }}</label>
              <select v-model="form.type" class="form-field__input">
                <option value="flower">{{ t('admin.flower') }}</option>
                <option value="vegetable">{{ t('admin.vegetable') }}</option>
                <option value="herb">{{ t('admin.herb') }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-field__label">Status</label>
              <div class="status-select-wrap">
                <span class="status-select-dot" :class="`status-select-dot--${form.status}`" />
                <select v-model="form.status" class="form-field__input status-select">
                  <option value="pending">{{ t('admin.pendingPlants') }}</option>
                  <option value="unverified">{{ t('admin.unverifiedPlants') }}</option>
                  <option value="verified">{{ t('admin.verifiedPlants') }}</option>
                </select>
              </div>
            </div>
          </div>

          <BilingualInput v-model="form.name" :label="t('admin.displayName')" :placeholder="t('admin.plantName')" />
        </section>

        <!-- ── Calendar ── -->
        <section class="form-section">
          <h2 class="form-section__title">{{ t('admin.calendar') }}</h2>
          <div class="form-stack">
            <MonthRangePicker v-model="form.calendar.indoorSowing" :label="t('admin.indoorSowing')" />
            <MonthRangePicker v-model="form.calendar.coldGreenhouse" :label="t('admin.coldGreenhouse')" />
            <MonthRangePicker v-model="form.calendar.outdoor" :label="t('admin.outdoor')" />
          </div>
        </section>

        <!-- ── Germination ── -->
        <section class="form-section">
          <h2 class="form-section__title">{{ t('admin.germination') }}</h2>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.germinationType') }}</label>
              <select v-model="form.germination" class="form-field__input">
                <option value="light">{{ t('admin.lightGerminator') }}</option>
                <option value="dark">{{ t('admin.darkGerminator') }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.sowingDepth') }}</label>
              <input v-model.number="form.sowingDepthMm" type="number" class="form-field__input" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.germDaysMin') }}</label>
              <input v-model.number="germinationDaysMin" type="number" class="form-field__input" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.germDaysMax') }}</label>
              <input v-model.number="germinationDaysMax" type="number" class="form-field__input" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.germTempMin') }}</label>
              <input v-model.number="germinationTempMin" type="number" class="form-field__input" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.germTempMax') }}</label>
              <input v-model.number="germinationTempMax" type="number" class="form-field__input" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.seedsPerCell') }}</label>
              <input v-model.number="form.seedsPerCell" type="number" class="form-field__input" />
            </div>
          </div>
        </section>

        <!-- ── Appearance ── -->
        <section class="form-section">
          <h2 class="form-section__title">{{ t('admin.appearance') }}</h2>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.heightMin') }}</label>
              <input v-model.number="heightMin" type="number" class="form-field__input" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.heightMax') }}</label>
              <input v-model.number="heightMax" type="number" class="form-field__input" />
            </div>
          </div>
          <ColorEditor v-model="form.colors" :label="t('admin.colors')" />

          <div class="form-field" style="margin-top: 14px">
            <label class="form-field__label">{{ t('admin.images') }}</label>
            <textarea
              :value="form.images.map(img => typeof img === 'string' ? img : img.url).join('\n')"
              class="form-field__input form-field__input--textarea"
              rows="3"
              placeholder="https://example.com/image.jpg"
              @input="form.images = ($event.target as HTMLTextAreaElement).value.split('\n').filter(Boolean)"
            />
          </div>
        </section>

        <!-- ── Care ── -->
        <section class="form-section">
          <h2 class="form-section__title">{{ t('admin.care') }}</h2>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.sun') }}</label>
              <select v-model="form.sun" class="form-field__input">
                <option value="full-sun">{{ t('admin.fullSun') }}</option>
                <option value="partial-shade">{{ t('admin.partialShade') }}</option>
                <option value="shade">{{ t('admin.shade') }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.minDistance') }}</label>
              <input v-model.number="form.minDistanceCm" type="number" class="form-field__input" />
            </div>
            <div class="form-field">
              <label class="form-field__label">{{ t('admin.pinching') }}</label>
              <select v-model="form.pinching" class="form-field__input">
                <option :value="true">{{ t('admin.yes') }}</option>
                <option :value="false">{{ t('admin.no') }}</option>
              </select>
            </div>
          </div>

          <div class="form-field" style="margin-top: 14px">
            <label class="form-field__label">{{ t('admin.plantingConditions') }}</label>
            <div class="checkbox-group">
              <label v-for="cond in allConditions" :key="cond" class="checkbox-item">
                <input
                  type="checkbox"
                  :checked="form.plantingConditions.includes(cond)"
                  @change="toggleCondition(cond)"
                />
                {{ t(`plant.${cond}`) }}
              </label>
            </div>
          </div>

          <CareStepEditor v-model="form.careSteps" :label="t('admin.careSteps')" />
        </section>

        <!-- ── Notes ── -->
        <section class="form-section">
          <h2 class="form-section__title">{{ t('admin.notes') }}</h2>
          <BilingualInput v-model="form.maintenanceNotes" :label="t('admin.maintenanceNotes')" multiline :placeholder="t('admin.careTips')" />
          <div style="margin-top: 14px">
            <BilingualInput v-model="stemTips" :label="t('admin.cutFlowerTips')" multiline :placeholder="t('admin.optionalTips')" />
          </div>
        </section>

        <!-- ── Action Bar ── -->
        <div class="action-bar">
          <button class="action-bar__btn action-bar__btn--cancel" @click="$router.push('/admin/plants')">
            {{ t('admin.cancel') }}
          </button>
          <button class="action-bar__btn action-bar__btn--save" @click="save()">
            {{ t('admin.save') }}
          </button>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { savePlant, createPlant } from 'src/services/plant-service';
import type { Plant, PlantType, PlantLifecycle, GerminationType, SunRequirement, PlantingCondition, PlantStatus, BilingualText } from 'src/types/plant';
import StatusBadge from 'src/components/admin/StatusBadge.vue';
import BilingualInput from 'src/components/admin/BilingualInput.vue';
import MonthRangePicker from 'src/components/admin/MonthRangePicker.vue';
import ColorEditor from 'src/components/admin/ColorEditor.vue';
import CareStepEditor from 'src/components/admin/CareStepEditor.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const plantStore = usePlantStore();

const isNew = computed(() => route.params.id === 'new');
const plant = computed(() =>
  isNew.value ? null : plantStore.getPlantById(route.params.id as string),
);

const allConditions: PlantingCondition[] = ['tray', 'pot', 'outdoor', 'sprout-tray'];

function emptyPlant(): Plant {
  return {
    id: '',
    species: '',
    variety: null,
    latinName: '',
    name: { nl: '', en: '' },
    type: 'flower' as PlantType,
    lifecycle: 'annual' as PlantLifecycle,
    calendar: { indoorSowing: null, coldGreenhouse: null, outdoor: null, harvestPeriod: null },
    germination: 'light' as GerminationType,
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
    sun: 'full-sun' as SunRequirement,
    propagation: 'seed',
    status: 'pending' as PlantStatus,
  };
}

const form = ref<Plant>(emptyPlant());
const stemTips = ref<BilingualText>({ nl: '', en: '' });

// Computed wrappers for nested optional fields
const germinationDaysMin = computed({
  get: () => form.value.germinationDays?.min ?? 0,
  set: (v: number) => { form.value.germinationDays = { min: v, max: form.value.germinationDays?.max ?? v }; },
});
const germinationDaysMax = computed({
  get: () => form.value.germinationDays?.max ?? 0,
  set: (v: number) => { form.value.germinationDays = { min: form.value.germinationDays?.min ?? v, max: v }; },
});
const germinationTempMin = computed({
  get: () => form.value.germinationTempC?.min ?? 0,
  set: (v: number) => { form.value.germinationTempC = { min: v, max: form.value.germinationTempC?.max ?? v }; },
});
const germinationTempMax = computed({
  get: () => form.value.germinationTempC?.max ?? 0,
  set: (v: number) => { form.value.germinationTempC = { min: form.value.germinationTempC?.min ?? v, max: v }; },
});
const heightMin = computed({
  get: () => form.value.heightCm?.min ?? 0,
  set: (v: number) => { form.value.heightCm = { min: v, max: form.value.heightCm?.max ?? v }; },
});
const heightMax = computed({
  get: () => form.value.heightCm?.max ?? 0,
  set: (v: number) => { form.value.heightCm = { min: form.value.heightCm?.min ?? v, max: v }; },
});

function toggleCondition(cond: PlantingCondition) {
  const idx = form.value.plantingConditions.indexOf(cond);
  if (idx >= 0) {
    form.value.plantingConditions.splice(idx, 1);
  } else {
    form.value.plantingConditions.push(cond);
  }
}

function generateId(species: string, variety: string | null): string {
  const parts = [species, variety].filter(Boolean).join(' ');
  return parts.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

onMounted(() => {
  if (plant.value) {
    form.value = JSON.parse(JSON.stringify(plant.value));
    stemTips.value = form.value.stemTips ?? { nl: '', en: '' };
  }
});

async function save() {
  // Generate ID from species + variety
  if (!form.value.id) {
    form.value.id = generateId(form.value.species, form.value.variety);
  }

  // Set stemTips
  if (stemTips.value.nl || stemTips.value.en) {
    form.value.stemTips = stemTips.value;
  } else {
    form.value.stemTips = null;
  }

  try {
    if (isNew.value) {
      await createPlant(form.value);
    } else {
      await savePlant(form.value);
    }
    $q.notify({ type: 'positive', message: t('admin.plantSaved') });
    void router.push('/admin/plants');
  } catch (err: unknown) {
    $q.notify({ type: 'negative', message: `${t('admin.failedToSave')}: ${String(err)}` });
  }
}

</script>

<style lang="scss" scoped>
.admin-page {
  padding: 24px 20px 120px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.admin-page__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--deep-brown);
}

.back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);

  .material-icons-outlined {
    font-size: 18px;
  }
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-section {
  background: var(--warm-white);
  border-radius: var(--radius-md);
  padding: 18px;
  box-shadow: var(--shadow-card);

  &__title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--deep-brown);
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-light);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-field {
  &__label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  &__input {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--deep-brown);
    background: var(--warm-white);
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: var(--clay-light);
    }

    &--textarea {
      resize: vertical;
    }
  }
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--ink-soft);
  cursor: pointer;

  input {
    accent-color: var(--moss);
  }
}

.action-bar {
  display: flex;
  gap: 10px;
  padding: 18px 0;
  position: sticky;
  bottom: 0;
  background: var(--sand);

  &__btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &--cancel {
      background: var(--warm-white);
      color: var(--muted);
      border: 1.5px solid var(--border);
    }

    &--save {
      background: var(--moss);
      color: #fff;
    }

  }
}

// ── Status select with dot ──
.status-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.status-select-dot {
  position: absolute;
  left: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;

  &--pending { background: var(--clay); }
  &--unverified { background: var(--cal-indoor); }
  &--verified { background: var(--moss); }
}

.status-select {
  padding-left: 26px !important;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);

  &__icon {
    font-size: 48px;
    color: var(--muted-light);
    display: block;
    margin-bottom: 8px;
  }

  &__link {
    display: inline-block;
    margin-top: 16px;
    padding: 10px 20px;
    border-radius: var(--radius-pill);
    background: var(--moss-pale);
    color: var(--moss);
    text-decoration: none;
    font-weight: 600;
  }
}
</style>
