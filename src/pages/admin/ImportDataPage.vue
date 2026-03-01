<template>
  <q-page class="admin-page">
    <h1 class="admin-page__title">{{ t('admin.importDataTitle') }}</h1>
    <p class="admin-page__desc">{{ t('admin.importDataDesc') }}</p>

    <!-- JSON input -->
    <div class="json-input-section">
      <textarea
        v-model="jsonInput"
        class="json-textarea"
        :placeholder="t('admin.jsonPlaceholder')"
        rows="10"
      />
      <button class="validate-btn" :disabled="!jsonInput.trim()" @click="validate">
        <span class="material-icons-outlined">fact_check</span>
        {{ t('admin.validate') }}
      </button>
    </div>

    <!-- Parse error -->
    <div v-if="parseError" class="parse-error">
      <span class="material-icons-outlined">error</span>
      {{ parseError }}
    </div>

    <!-- Validation results -->
    <template v-if="validationResults.length > 0">
      <div class="results-header">
        <h2 class="results-header__title">
          {{ t('admin.validationResults') }}
          <span class="results-header__count">
            {{ validCount }}/{{ validationResults.length }} {{ t('admin.valid') }}
          </span>
        </h2>
      </div>

      <div class="results-list">
        <ImportValidationPanel
          v-for="(result, index) in validationResults"
          :key="index"
          :result="result"
        />
      </div>

      <button
        class="import-btn"
        :disabled="validCount === 0"
        @click="importPlants"
      >
        <span class="material-icons-outlined">upload</span>
        {{ t('admin.importBtn') }} {{ validCount }} {{ validCount !== 1 ? t('admin.plantsWord') : t('admin.plant') }}
      </button>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePlantValidator, type ValidationResult } from 'src/composables/usePlantValidator';
import { savePlant } from 'src/services/plant-service';
import ImportValidationPanel from 'src/components/admin/ImportValidationPanel.vue';

const $q = useQuasar();
const { t } = useI18n();
const { parseAndValidate } = usePlantValidator();

const jsonInput = ref('');
const parseError = ref('');
const validationResults = ref<ValidationResult[]>([]);

const validCount = computed(() => validationResults.value.filter((r) => r.valid).length);

function validate() {
  parseError.value = '';
  validationResults.value = [];

  const { results, parseError: err } = parseAndValidate(jsonInput.value);
  if (err) {
    parseError.value = err;
    return;
  }
  validationResults.value = results;
}

async function importPlants() {
  const validPlants = validationResults.value.filter((r) => r.valid);
  let imported = 0;

  for (const result of validPlants) {
    try {
      await savePlant(result.plant);
      imported++;
    } catch (err) {
      console.error(`Failed to import ${result.plant.id}:`, err);
    }
  }

  $q.notify({
    type: 'positive',
    message: t('admin.importSuccess', { count: imported }),
  });

  // Reset
  jsonInput.value = '';
  validationResults.value = [];
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

.json-input-section {
  margin-bottom: 16px;
}

.json-textarea {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  font-family: 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--deep-brown);
  background: var(--warm-white);
  resize: vertical;
  outline: none;
  margin-bottom: 10px;

  &:focus {
    border-color: var(--clay-light);
  }
}

.validate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--clay);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  .material-icons-outlined {
    font-size: 18px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.parse-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 16px;
  background: var(--overdue-bg);
  border-radius: var(--radius-md);
  color: var(--overdue);
  font-size: 13px;
  margin-bottom: 16px;

  .material-icons-outlined {
    font-size: 18px;
    flex-shrink: 0;
  }
}

.results-header {
  margin-bottom: 14px;

  &__title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    color: var(--deep-brown);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__count {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    background: var(--moss-pale);
    color: var(--moss);
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.import-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--moss);
  color: #fff;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  .material-icons-outlined {
    font-size: 18px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
