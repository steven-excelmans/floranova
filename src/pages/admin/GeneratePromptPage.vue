<template>
  <q-page class="admin-page">
    <h1 class="admin-page__title">{{ t('admin.generatePrompt') }}</h1>
    <p class="admin-page__desc">{{ t('admin.generatePromptDesc') }}</p>

    <!-- Plant selection -->
    <div class="select-section">
      <div class="select-header">
        <label class="select-header__label">
          <input type="checkbox" :checked="allSelected" @change="toggleAll" />
          {{ t('admin.selectAllPending') }} ({{ pendingPlants.length }})
        </label>
      </div>

      <div class="plant-select-list">
        <label v-for="plant in pendingPlants" :key="plant.id" class="plant-select-item">
          <input type="checkbox" :checked="selectedIds.has(plant.id)" @change="togglePlant(plant.id)" />
          <span class="plant-select-item__name">{{ plant.species }}</span>
          <span v-if="plant.variety" class="plant-select-item__variety">'{{ plant.variety }}'</span>
        </label>
      </div>

      <div v-if="pendingPlants.length === 0" class="empty-hint">
        {{ t('admin.noPendingPlants') }} <router-link to="/admin/plants/add-names">{{ t('admin.addNamesFirst') }}</router-link>
      </div>
    </div>

    <!-- Generate button -->
    <button class="generate-btn" :disabled="selectedIds.size === 0" @click="generate">
      <span class="material-icons-outlined">auto_awesome</span>
      {{ t('admin.generateFor') }} {{ selectedIds.size }} {{ selectedIds.size !== 1 ? t('admin.plantsWord') : t('admin.plant') }}
    </button>

    <!-- Generated prompt -->
    <template v-if="generatedPrompt">
      <div class="prompt-section">
        <div class="prompt-header">
          <h2 class="prompt-header__title">{{ t('admin.generatedPrompt') }}</h2>
          <button class="copy-btn" @click="copyPrompt">
            <span class="material-icons-outlined">{{ copied ? 'check' : 'content_copy' }}</span>
            {{ copied ? t('admin.copied') : t('admin.copyPrompt') }}
          </button>
        </div>
        <pre class="prompt-preview">{{ generatedPrompt }}</pre>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { usePromptGenerator } from 'src/composables/usePromptGenerator';

const { t } = useI18n();
const plantStore = usePlantStore();
const { generatePrompt: buildPrompt } = usePromptGenerator();

const selectedIds = ref(new Set<string>());
const generatedPrompt = ref('');
const copied = ref(false);

const pendingPlants = computed(() =>
  plantStore.plants.filter((p) => p.status === 'pending'),
);

const allSelected = computed(
  () => pendingPlants.value.length > 0 && pendingPlants.value.every((p) => selectedIds.value.has(p.id)),
);

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value.clear();
  } else {
    selectedIds.value = new Set(pendingPlants.value.map((p) => p.id));
  }
}

function togglePlant(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
  // Trigger reactivity
  selectedIds.value = new Set(selectedIds.value);
}

function generate() {
  const selected = plantStore.plants.filter((p) => selectedIds.value.has(p.id));
  // Use first verified plant as example
  const example = plantStore.plants.find((p) => p.status === 'verified' || p.status === 'unverified');
  generatedPrompt.value = buildPrompt(selected, example);
}

async function copyPrompt() {
  await navigator.clipboard.writeText(generatedPrompt.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
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

.select-section {
  background: var(--warm-white);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}

.select-header {
  margin-bottom: 10px;

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--deep-brown);
    cursor: pointer;

    input {
      accent-color: var(--moss);
    }
  }
}

.plant-select-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plant-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--sand);
  }

  input {
    accent-color: var(--moss);
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--deep-brown);
  }

  &__variety {
    font-size: 14px;
    color: var(--muted);
    font-style: italic;
  }
}

.empty-hint {
  font-size: 13px;
  color: var(--muted);
  padding: 12px 0;

  a {
    color: var(--clay);
    font-weight: 500;
  }
}

.generate-btn {
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
  margin-bottom: 24px;

  .material-icons-outlined {
    font-size: 18px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.prompt-section {
  background: var(--warm-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);

  &__title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--deep-brown);
  }
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  background: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--moss);

  .material-icons-outlined {
    font-size: 14px;
  }
}

.prompt-preview {
  padding: 16px;
  font-family: 'Menlo', monospace;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--ink-soft);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
  background: var(--sand);
  margin: 0;
}
</style>
