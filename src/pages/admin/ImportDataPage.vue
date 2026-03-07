<template>
  <q-page class="import-page">
    <!-- ═══ STEP 1 — Paste JSON ═══ -->
    <div v-if="currentStep === 1" class="step-view">
      <StepsBar :current="1" :steps="stepLabels" @go="goToStep" />

      <div class="section-label">
        <div class="section-label__icon">
          <span class="material-icons-outlined">data_object</span>
        </div>
        <span class="section-label__text">{{ t('admin.pasteJson') }}</span>
        <span class="section-label__line" />
      </div>

      <div class="paste-area">
        <textarea
          v-model="jsonInput"
          class="paste-textarea"
          :placeholder="t('admin.jsonPlaceholder')"
          spellcheck="false"
        />
      </div>

      <div v-if="parseError" class="parse-error">
        <span class="material-icons-outlined">error</span>
        <span>{{ parseError }}</span>
      </div>

      <div class="paste-hint">
        <span class="material-icons-outlined">info</span>
        {{ t('admin.pasteHint') }} {{ t('admin.pasteHintImages') }}
      </div>

      <button class="btn-validate" :disabled="!jsonInput.trim()" @click="validate">
        <span class="material-icons-outlined">verified</span>
        {{ t('admin.validate') }}
      </button>
    </div>

    <!-- ═══ STEP 2 — Review (plants) ═══ -->
    <div v-if="currentStep === 2 && importMode === 'plants'" class="step-view">
      <StepsBar :current="2" :steps="stepLabels" @go="goToStep" />

      <div class="results-header">
        <div class="results-header__left">
          <span class="results-header__title">{{ t('admin.validation') }}</span>
          <span class="results-badge results-badge--valid">
            <span class="material-icons-outlined">check</span>
            {{ validCount }} {{ t('admin.valid') }}
          </span>
          <span v-if="errorCount > 0" class="results-badge results-badge--errors">
            <span class="material-icons-outlined">close</span>
            {{ errorCount }} {{ errorCount === 1 ? t('admin.error') : t('admin.errors') }}
          </span>
        </div>
        <button class="results-header__edit" @click="goToStep(1)">
          <span class="material-icons-outlined">edit</span>
          JSON
        </button>
      </div>

      <div class="plant-list">
        <button
          v-for="(result, index) in validationResults"
          :key="index"
          class="plant-row"
          :class="{ 'plant-row--invalid': !result.valid }"
          @click="openEditDialog(result)"
        >
          <div class="type-icon" :class="result.plant.type">
            <span class="material-icons-outlined">{{ typeIcon(result.plant.type) }}</span>
          </div>
          <div class="plant-row__info">
            <div class="plant-row__name">
              {{ plantDisplayName(result.plant) }}
              <span
                class="material-icons-outlined validation-icon"
                :class="result.valid ? 'validation-icon--valid' : 'validation-icon--error'"
              >{{ result.valid ? 'check_circle' : 'cancel' }}</span>
            </div>
            <div class="plant-row__sub">
              <span class="plant-row__species">{{ result.plant.species }}</span>
              <span v-if="result.plant.variety" class="plant-row__variety">{{ result.plant.variety }}</span>
            </div>
            <div class="plant-row__badges">
              <span v-if="result.valid && !isExisting(result.plant.id)" class="badge badge--new">{{ t('admin.badgeNew') }}</span>
              <span v-if="result.valid && isExisting(result.plant.id)" class="badge badge--update">{{ t('admin.badgeUpdate') }}</span>
              <span v-if="!result.valid" class="badge badge--error">
                <span class="material-icons-outlined">error_outline</span>
                {{ result.errors.length }} {{ t('admin.badgeMissing') }}
              </span>
              <span v-if="result.warnings.length > 0" class="badge badge--warning">
                <span class="material-icons-outlined">warning_amber</span>
                {{ result.warnings.length }} {{ result.warnings.length === 1 ? t('admin.badgeWarning') : t('admin.badgeWarnings') }}
              </span>
            </div>
          </div>
          <span class="material-icons-outlined row-chevron">chevron_right</span>
        </button>
      </div>

      <button class="btn-import" :disabled="validCount === 0 || importing" @click="doImport">
        <span class="material-icons-outlined">upload</span>
        {{ t('admin.importBtn') }}
        <span class="btn-import__count">{{ validCount }} {{ validCount === 1 ? t('admin.plant') : t('admin.plantsWord') }}</span>
      </button>
    </div>

    <!-- ═══ STEP 2 — Review (images) ═══ -->
    <div v-if="currentStep === 2 && importMode === 'images'" class="step-view">
      <StepsBar :current="2" :steps="stepLabels" @go="goToStep" />

      <div class="results-header">
        <div class="results-header__left">
          <span class="results-header__title">{{ t('admin.imagesNav') }}</span>
          <span class="results-badge results-badge--valid">
            <span class="material-icons-outlined">check</span>
            {{ imageResults.filter(r => r.found).length }} {{ t('admin.valid') }}
          </span>
          <span v-if="imageResults.filter(r => !r.found).length > 0" class="results-badge results-badge--errors">
            <span class="material-icons-outlined">close</span>
            {{ imageResults.filter(r => !r.found).length }} {{ t('admin.imagesMissing') }}
          </span>
        </div>
        <button class="results-header__edit" @click="goToStep(1)">
          <span class="material-icons-outlined">edit</span>
          JSON
        </button>
      </div>

      <div class="plant-list">
        <div
          v-for="result in imageResults"
          :key="result.plantId"
          class="plant-row plant-row--static"
          :class="{ 'plant-row--invalid': !result.found }"
        >
          <div class="img-thumb">
            <img v-if="result.found" :src="result.url" :alt="result.plantId" loading="lazy" />
            <span v-else class="material-icons-outlined">broken_image</span>
          </div>
          <div class="plant-row__info">
            <div class="plant-row__name">
              {{ result.plantName }}
              <span
                class="material-icons-outlined validation-icon"
                :class="result.found ? 'validation-icon--valid' : 'validation-icon--error'"
              >{{ result.found ? 'check_circle' : 'cancel' }}</span>
            </div>
            <div class="plant-row__sub">
              <span class="plant-row__species">{{ result.plantId }}</span>
            </div>
            <div v-if="!result.found" class="plant-row__badges">
              <span class="badge badge--error">
                <span class="material-icons-outlined">error_outline</span>
                {{ t('admin.plantNotFound') }}
              </span>
            </div>
            <div v-else-if="result.hasImage" class="plant-row__badges">
              <span class="badge badge--update">{{ t('admin.badgeUpdate') }}</span>
            </div>
            <div v-else class="plant-row__badges">
              <span class="badge badge--new">{{ t('admin.badgeNew') }}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        class="btn-import"
        :disabled="imageResults.filter(r => r.found).length === 0 || importing"
        @click="doImageImport"
      >
        <span class="material-icons-outlined">cloud_upload</span>
        {{ importing ? imageProgress : t('admin.importBtn') }}
        <span v-if="!importing" class="btn-import__count">
          {{ imageResults.filter(r => r.found).length }} {{ t('admin.imagesNav').toLowerCase() }}
        </span>
      </button>
    </div>

    <!-- ═══ STEP 3 — Done ═══ -->
    <div v-if="currentStep === 3" class="step-view">
      <StepsBar :current="3" :steps="stepLabels" @go="goToStep" />

      <div class="done-container">
        <div class="done-icon">
          <span class="material-icons-outlined">check_circle</span>
        </div>
        <h2 class="done-title">{{ t('admin.importDone') }}</h2>
        <p v-if="importMode === 'plants'" class="done-desc">
          {{ t('admin.importDoneDesc', { count: importedPlants.length }) }}
        </p>
        <p v-else class="done-desc">
          {{ importedImageCount }} images uploaded to Cloudinary
        </p>

        <div v-if="failedCount > 0" class="done-warning">
          <span class="material-icons-outlined">warning_amber</span>
          <span>{{ t('admin.importPartialFail', { count: failedCount }) }}</span>
        </div>

        <!-- Plant import results -->
        <div v-if="importMode === 'plants'" class="done-list">
          <div v-for="plant in importedPlants" :key="plant.id" class="plant-row plant-row--static">
            <div class="type-icon" :class="plant.type">
              <span class="material-icons-outlined">{{ typeIcon(plant.type) }}</span>
            </div>
            <div class="plant-row__info">
              <div class="plant-row__name">{{ plantDisplayName(plant) }}</div>
              <div class="plant-row__sub">
                <span class="plant-row__species">{{ plant.species }}</span>
                <span v-if="plant.variety" class="plant-row__variety">{{ plant.variety }}</span>
              </div>
            </div>
            <span class="badge" :class="wasExisting(plant.id) ? 'badge--update' : 'badge--new'">
              {{ wasExisting(plant.id) ? t('admin.badgeUpdated') : t('admin.badgeNew') }}
            </span>
          </div>
        </div>

        <!-- Image import results -->
        <div v-if="importMode === 'images'" class="done-list">
          <div
            v-for="entry in imageResults.filter(r => r.found)"
            :key="entry.plantId"
            class="plant-row plant-row--static"
          >
            <div class="img-thumb">
              <img :src="entry.url" :alt="entry.plantId" loading="lazy" />
            </div>
            <div class="plant-row__info">
              <div class="plant-row__name">{{ entry.plantName }}</div>
              <div class="plant-row__sub">
                <span class="plant-row__species">{{ entry.plantId }}</span>
              </div>
            </div>
            <span class="material-icons-outlined" style="color: var(--moss); font-size: 20px;">cloud_done</span>
          </div>
        </div>

        <div class="done-actions">
          <router-link to="/admin/plants" class="btn-view-plants">
            <span class="material-icons-outlined">eco</span>
            {{ t('admin.viewAllPlants') }}
          </router-link>
          <button class="btn-import-more" @click="reset">
            <span class="material-icons-outlined">add</span>
            {{ t('admin.importMore') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit dialog (reuse existing) -->
    <PlantEditDialog
      v-model="editDialogOpen"
      :plant-id="editPlantId"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantValidator, type ValidationResult } from 'src/composables/usePlantValidator';
import { savePlant, addPlantImage } from 'src/services/plant-service';
import { uploadRemoteUrl } from 'src/services/image-service';
import { usePlantStore } from 'src/stores/plant-store';
import type { Plant } from 'src/types/plant';
import PlantEditDialog from 'src/components/admin/PlantEditDialog.vue';
import StepsBar from 'src/components/admin/StepsBar.vue';

const { t } = useI18n();
const { parseAndValidate } = usePlantValidator();
const plantStore = usePlantStore();

const currentStep = ref(1);
const jsonInput = ref('');
const parseError = ref('');
const importMode = ref<'plants' | 'images'>('plants');
const validationResults = ref<ValidationResult[]>([]);
const importing = ref(false);
const importedPlants = ref<Plant[]>([]);
const failedCount = ref(0);
const existingIdsAtImport = ref<Set<string>>(new Set());

// Image import
interface ImageImportEntry {
  plantId: string;
  url: string;
  plantName: string;
  found: boolean;
  hasImage: boolean;
}
const imageResults = ref<ImageImportEntry[]>([]);
const imageProgress = ref('');
const importedImageCount = ref(0);

// Edit dialog
const editDialogOpen = ref(false);
const editPlantId = ref<string | null>(null);

const stepLabels = computed(() => [
  t('admin.stepPaste'),
  t('admin.stepReview'),
  t('admin.stepImport'),
]);

const validCount = computed(() => validationResults.value.filter((r) => r.valid).length);
const errorCount = computed(() => validationResults.value.filter((r) => !r.valid).length);

const typeIconMap: Record<string, string> = { flower: 'local_florist', herb: 'grass', vegetable: 'spa' };
function typeIcon(type: string) { return typeIconMap[type] ?? 'local_florist'; }

function plantDisplayName(plant: Plant): string {
  const name = plant.name?.nl || plant.name?.en || plant.species;
  return plant.variety ? `${name}` : name;
}

function isExisting(id: string): boolean {
  return !!plantStore.getPlantById(id);
}

function wasExisting(id: string): boolean {
  return existingIdsAtImport.value.has(id);
}

function goToStep(step: number) {
  if (step === 2 && validationResults.value.length === 0 && imageResults.value.length === 0) return;
  if (step === 3 && importedPlants.value.length === 0 && importedImageCount.value === 0) return;
  if (step === 1) {
    importMode.value = 'plants';
    imageResults.value = [];
    validationResults.value = [];
  }
  currentStep.value = step;
}

/**
 * Detect if JSON is an image import format:
 * { "plant-id": { "url": "https://..." }, ... }
 * or { "plant-id": { "species": "...", "url": "https://..." }, ... }
 */
function isImageFormat(parsed: unknown): parsed is Record<string, { url: string }> {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  const entries = Object.values(parsed as Record<string, unknown>);
  if (entries.length === 0) return false;
  // Check first few entries have a url field and no typical plant fields
  return entries.slice(0, 3).every(
    (e) => e && typeof e === 'object' && 'url' in (e as Record<string, unknown>),
  );
}

function validate() {
  parseError.value = '';
  validationResults.value = [];
  imageResults.value = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonInput.value);
  } catch (e) {
    parseError.value = `Invalid JSON: ${(e as Error).message}`;
    return;
  }

  if (isImageFormat(parsed)) {
    importMode.value = 'images';
    const entries = Object.entries(parsed);
    imageResults.value = entries.map(([key, data]) => {
      const extra = data as Record<string, unknown>;
      const speciesStr = (extra.species as string) || '';

      // 1. Try key as plant ID
      let plant = plantStore.getPlantById(key);

      // 2. Try matching by species + variety from species string
      if (!plant && speciesStr) {
        const varMatch = speciesStr.match(/^(.+?)\s+[''\u2018]([^''\u2019]+)[''\u2019]$/);
        if (varMatch) {
          plant = plantStore.plants.find(
            (p) => p.species === varMatch[1] && p.variety === varMatch[2],
          );
        }
        // 3. Try exact species match (for plants without variety)
        if (!plant) {
          plant = plantStore.plants.find((p) => p.species === speciesStr && !p.variety);
        }
        // 4. Try species-only match (first match)
        if (!plant) {
          plant = plantStore.plants.find((p) => p.species === speciesStr);
        }
      }

      const name = plant
        ? (plant.name?.nl || plant.name?.en || plant.species)
        : speciesStr || key;
      return {
        plantId: plant?.id ?? key,
        url: data.url,
        plantName: plant ? `${name}${plant.variety ? ` '${plant.variety}'` : ''}` : name,
        found: !!plant,
        hasImage: !!plant && plant.images.length > 0,
      };
    });
    currentStep.value = 2;
    return;
  }

  importMode.value = 'plants';
  const { results, parseError: err } = parseAndValidate(jsonInput.value, plantStore.plants);
  if (err) {
    parseError.value = err;
    return;
  }
  validationResults.value = results;
  currentStep.value = 2;
}

async function openEditDialog(result: ValidationResult) {
  try {
    await savePlant(result.plant);
    editPlantId.value = result.plant.id;
    editDialogOpen.value = true;
  } catch (err) {
    console.error('Failed to save plant for editing:', err);
  }
}

async function doImport() {
  importing.value = true;
  const validPlants = validationResults.value.filter((r) => r.valid);

  existingIdsAtImport.value = new Set(
    validPlants.filter((r) => isExisting(r.plant.id)).map((r) => r.plant.id),
  );

  const imported: Plant[] = [];
  let failed = 0;

  for (const result of validPlants) {
    try {
      await savePlant(result.plant);
      imported.push(result.plant);
    } catch (err) {
      console.error(`Failed to import ${result.plant.id}:`, err);
      failed++;
    }
  }

  importedPlants.value = imported;
  failedCount.value = failed;
  importing.value = false;
  currentStep.value = 3;
}

async function doImageImport() {
  importing.value = true;
  const toImport = imageResults.value.filter((r) => r.found);
  let done = 0;
  let failed = 0;

  for (const entry of toImport) {
    imageProgress.value = `${done + 1} / ${toImport.length}`;
    try {
      const cloudinaryUrl = await uploadRemoteUrl(entry.plantId, entry.url);
      await addPlantImage(entry.plantId, { url: cloudinaryUrl });
      done++;
    } catch (err) {
      console.error(`Failed to import image for ${entry.plantId}:`, err);
      failed++;
    }
  }

  importedImageCount.value = done;
  failedCount.value = failed;
  importing.value = false;
  currentStep.value = 3;
}

function reset() {
  currentStep.value = 1;
  jsonInput.value = '';
  parseError.value = '';
  importMode.value = 'plants';
  validationResults.value = [];
  imageResults.value = [];
  importedPlants.value = [];
  importedImageCount.value = 0;
  failedCount.value = 0;
  existingIdsAtImport.value = new Set();
}
</script>

<style lang="scss" scoped>
.import-page {
  padding: 0 0 100px;
}

.step-view {
  padding: 16px 16px 28px;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Section label ── */
.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--clay-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--clay);

    .material-icons-outlined { font-size: 16px; }
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

/* ── Textarea ── */
.paste-area {
  margin-bottom: 12px;
}

.paste-textarea {
  width: 100%;
  height: 320px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--warm-white);
  padding: 14px;
  font-family: 'Menlo', 'Courier New', monospace;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--deep-brown);
  outline: none;
  resize: none;
  transition: border-color 0.2s ease;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
  &:focus { border-color: var(--clay-light); }

  &::placeholder {
    color: var(--muted-light);
    font-family: var(--font-body);
    font-style: italic;
    font-size: 13px;
  }
}

/* ── Parse error ── */
.parse-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  background: var(--overdue-bg);
  border-radius: var(--radius-sm);
  color: var(--overdue);
  font-size: 12.5px;
  line-height: 1.4;
  margin-bottom: 14px;

  .material-icons-outlined {
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }
}

/* ── Paste hint ── */
.paste-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 11.5px;
  color: var(--muted-light);

  .material-icons-outlined {
    font-size: 14px;
  }
}

/* ── Validate button ── */
.btn-validate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--clay);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-button);

  .material-icons-outlined { font-size: 18px; }
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

/* ═══ STEP 2 — Review ═══ */

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--deep-brown);
  }

  &__edit {
    font-size: 12px;
    font-weight: 500;
    color: var(--clay);
    cursor: pointer;
    background: none;
    border: none;
    font-family: var(--font-body);
    display: flex;
    align-items: center;
    gap: 4px;

    .material-icons-outlined { font-size: 14px; }
  }
}

.results-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .material-icons-outlined { font-size: 13px; }

  &--valid {
    background: var(--moss-pale);
    color: var(--moss);
  }

  &--errors {
    background: var(--overdue-bg);
    color: var(--overdue);
  }
}

/* ── Plant rows ── */
.plant-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.plant-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--warm-white);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  width: 100%;
  text-align: left;
  font-family: var(--font-body);

  & + & {
    margin-top: 8px;
  }

  &:hover {
    background: var(--moss-ghost);
  }

  &--static {
    cursor: default;

    &:hover {
      background: var(--warm-white);
    }
  }
}

.plant-row__info {
  flex: 1;
  min-width: 0;
}

.plant-row__name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--deep-brown);
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 6px;
}

.plant-row__sub {
  margin-top: 2px;
  font-size: 11.5px;
  line-height: 1.3;
  color: var(--muted);
}

.plant-row__species {
  font-style: italic;
}

.plant-row__variety {
  color: var(--muted-light);

  &::before {
    content: ' \00b7 ';
  }
}

/* ── Type icon ── */
.type-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .material-icons-outlined { font-size: 15px; }

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

/* ── Validation icon ── */
.validation-icon {
  font-size: 14px !important;
  flex-shrink: 0;

  &--valid { color: var(--moss); }
  &--error { color: var(--overdue); }
}

/* ── Badges ── */
.plant-row__badges {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.1px;
  line-height: 1.2;

  .material-icons-outlined { font-size: 12px; }

  &--new {
    background: var(--moss-pale);
    color: var(--moss);
  }

  &--update {
    background: var(--clay-pale);
    color: var(--clay);
  }

  &--error {
    background: var(--overdue-bg);
    color: var(--overdue);
  }

  &--warning {
    background: var(--soon-bg);
    color: var(--soon);
  }
}

.row-chevron {
  font-size: 18px;
  color: var(--muted-light);
  flex-shrink: 0;
}

/* ── Image thumbnail ── */
.img-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--sand);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .material-icons-outlined {
    font-size: 20px;
    color: var(--muted-light);
  }
}

/* ── Import button ── */
.btn-import {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--moss);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(92, 107, 78, 0.2);

  .material-icons-outlined { font-size: 18px; }
  &:hover { background: var(--moss-light); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }

  &__count {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    font-size: 13px;
    font-weight: 700;
  }
}

/* ═══ STEP 3 — Done ═══ */

.done-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 28px;
}

.done-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--moss-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  .material-icons-outlined {
    font-size: 32px;
    color: var(--moss);
  }
}

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.done-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--deep-brown);
  margin-bottom: 6px;
  text-align: center;
}

.done-desc {
  font-size: 13px;
  color: var(--muted);
  text-align: center;
  line-height: 1.5;
  margin-bottom: 24px;
  max-width: 280px;
}

.done-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  background: var(--soon-bg);
  border-radius: var(--radius-sm);
  color: var(--soon);
  font-size: 12.5px;
  line-height: 1.4;
  margin-bottom: 14px;

  .material-icons-outlined {
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }
}

.done-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  .plant-row + .plant-row {
    margin-top: 4px;
  }
}

.done-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-view-plants {
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
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(92, 107, 78, 0.2);

  .material-icons-outlined { font-size: 18px; }
  &:hover { background: var(--moss-light); }
}

.btn-import-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 20px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--warm-white);
  color: var(--deep-brown);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  .material-icons-outlined { font-size: 17px; }
  &:hover { border-color: var(--clay-light); color: var(--clay); }
}

@media (prefers-reduced-motion: reduce) {
  .step-view,
  .done-icon {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
