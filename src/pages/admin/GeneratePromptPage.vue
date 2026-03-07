<template>
  <q-page class="prompt-page">
    <!-- Section header -->
    <div class="section-header">
      <div class="section-header__icon">
        <span class="material-icons-outlined">hourglass_top</span>
      </div>
      <span class="section-header__title">{{ t('admin.pendingPlantsTitle') }}</span>
      <span class="section-header__count">{{ pendingPlants.length }}</span>
    </div>

    <!-- Select toolbar -->
    <div v-if="pendingPlants.length > 0" class="select-toolbar">
      <div class="select-toolbar__left" @click="toggleAll">
        <div class="select-toolbar__checkbox" :class="{ 'select-toolbar__checkbox--checked': allSelected }">
          <span class="material-icons-outlined">check</span>
        </div>
        <span class="select-toolbar__label">{{ t('admin.selectAllPending') }}</span>
      </div>
      <span class="select-toolbar__info">
        {{ selectedIds.size }} {{ t('admin.ofCount') }} {{ pendingPlants.length }} {{ t('admin.selectedLabel') }}
      </span>
    </div>

    <!-- Pending plant cards -->
    <div v-if="pendingPlants.length > 0" class="pending-list">
      <div
        v-for="plant in pendingPlants"
        :key="plant.id"
        class="pending-card"
        :class="{ 'pending-card--selected': selectedIds.has(plant.id) }"
        @click="togglePlant(plant.id)"
      >
        <div class="pending-card__checkbox">
          <span class="material-icons-outlined">check</span>
        </div>
        <div class="pending-card__info">
          <span class="pending-card__species">{{ plant.species }}</span>
          <span v-if="plant.variety" class="pending-card__cultivar">'{{ plant.variety }}'</span>
        </div>
        <div class="pending-card__right">
          <span class="pending-card__date">{{ formatDate(plant) }}</span>
          <button class="pending-card__delete" @click.stop="removePending(plant.id)">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-hint">
      <span class="material-icons-outlined empty-hint__icon">inventory_2</span>
      <p>{{ t('admin.noPendingPlants') }}</p>
      <p class="empty-hint__sub">{{ t('admin.addNamesFirst') }}</p>
    </div>

    <!-- Action buttons -->
    <div v-if="pendingPlants.length > 0" class="action-area">
      <button class="generate-btn" :disabled="selectedIds.size === 0" @click="generate">
        <span class="material-icons-outlined">auto_awesome</span>
        {{ t('admin.generateFor') }} {{ selectedIds.size }} {{ selectedIds.size !== 1 ? t('admin.plantsWord') : t('admin.plant') }}
      </button>
      <button class="delete-selected-btn" :disabled="selectedIds.size === 0" @click="deleteSelected">
        <span class="material-icons-outlined">delete_outline</span>
        {{ t('admin.deleteSelected') }}
        <span v-if="selectedIds.size > 0" class="delete-selected-btn__count">{{ selectedIds.size }}</span>
      </button>
    </div>

    <!-- Generated prompt output -->
    <template v-if="generatedPrompt">
      <div class="prompt-output">
        <div class="prompt-output__header">
          <span class="prompt-output__title">
            <span class="material-icons-outlined">terminal</span>
            {{ t('admin.generatedPrompt') }}
          </span>
          <button class="copy-btn" @click="copyPrompt">
            <span class="material-icons-outlined">{{ copied ? 'check' : 'content_copy' }}</span>
            {{ copied ? t('admin.copied') : t('admin.copyPrompt') }}
          </button>
        </div>
        <pre class="prompt-output__code">{{ generatedPrompt }}</pre>
      </div>
    </template>

    <!-- FAB -->
    <button class="fab" @click="showSheet = true">
      <span class="material-icons-outlined">add</span>
    </button>

    <!-- Add Plants bottom sheet -->
    <AddPlantsSheet v-model="showSheet" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { usePromptGenerator } from 'src/composables/usePromptGenerator';
import { deletePlant } from 'src/services/plant-service';
import AddPlantsSheet from 'src/components/admin/AddPlantsSheet.vue';

const $q = useQuasar();
const { t, locale } = useI18n();
const plantStore = usePlantStore();
const { generatePrompt: buildPrompt } = usePromptGenerator();

const selectedIds = ref(new Set<string>());
const generatedPrompt = ref('');
const copied = ref(false);
const showSheet = ref(false);

const pendingPlants = computed(() =>
  plantStore.plants.filter((p) => p.status === 'pending'),
);

const allSelected = computed(
  () => pendingPlants.value.length > 0 && pendingPlants.value.every((p) => selectedIds.value.has(p.id)),
);

function formatDate(plant: { createdAt?: string }) {
  if (!plant.createdAt) return '';
  const date = new Date(plant.createdAt);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-BE' : 'en-US', { day: 'numeric', month: 'short' });
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

function deleteSelected() {
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

function generate() {
  const selected = plantStore.plants.filter((p) => selectedIds.value.has(p.id));
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
.prompt-page {
  padding: 12px 16px 100px;
  overflow-x: hidden;
}

// ── Section header ──
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--clay-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--clay);
    flex-shrink: 0;

    .material-icons-outlined {
      font-size: 18px;
    }
  }

  &__title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--deep-brown);
    line-height: 1.2;
  }

  &__count {
    font-size: 11px;
    font-weight: 700;
    color: var(--clay);
    background: var(--clay-pale);
    padding: 2px 9px;
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

// ── Pending plant cards ──
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.pending-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: var(--warm-white);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid transparent;

  &:hover {
    box-shadow: var(--shadow-card);
  }

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
    gap: 1px;
    flex: 1;
    min-width: 0;
  }

  &__species {
    font-size: 14px;
    font-weight: 400;
    color: var(--deep-brown);
    font-style: italic;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__cultivar {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.3;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__date {
    font-size: 10px;
    font-weight: 600;
    color: var(--clay);
    white-space: nowrap;
    background: var(--clay-pale);
    padding: 2px 9px;
    border-radius: var(--radius-pill);
    letter-spacing: 0.2px;
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
    opacity: 0;

    .material-icons-outlined {
      font-size: 16px;
    }

    &:hover {
      background: rgba(194, 91, 78, 0.08);
      color: var(--overdue);
    }
  }

  &:hover &__delete {
    opacity: 1;
  }
}

// ── Action buttons ──
.action-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
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
}

// ── Delete selected button ──
.delete-selected-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 20px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--warm-white);
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  .material-icons-outlined {
    font-size: 17px;
  }

  &:hover:not(:disabled) {
    border-color: var(--overdue);
    color: var(--overdue);
    background: var(--overdue-bg);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &__count {
    background: var(--border-light);
    padding: 1px 9px;
    border-radius: var(--radius-pill);
    font-size: 12px;
    font-weight: 700;
  }

  &:hover:not(:disabled) &__count {
    background: rgba(194, 91, 78, 0.12);
  }
}

// ── Prompt output ──
.prompt-output {
  background: var(--warm-white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-light);
  }

  &__title {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 600;
    color: var(--deep-brown);
    display: flex;
    align-items: center;
    gap: 6px;

    .material-icons-outlined {
      font-size: 16px;
      color: var(--moss);
    }
  }

  &__code {
    padding: 14px 16px;
    font-family: 'Menlo', 'Courier New', monospace;
    font-size: 11.5px;
    line-height: 1.65;
    color: var(--deep-brown);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 300px;
    overflow-y: auto;
    background: var(--sand);
    margin: 0;
    scrollbar-width: none;

    &::-webkit-scrollbar { display: none; }
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
  font-size: 11.5px;
  font-weight: 600;
  color: var(--moss);
  transition: all 0.2s ease;

  .material-icons-outlined {
    font-size: 13px;
  }

  &:hover {
    border-color: var(--moss);
    background: var(--moss-pale);
  }
}

// ── Empty state ──
.empty-hint {
  text-align: center;
  padding: 40px 16px;

  &__icon {
    font-size: 40px;
    color: var(--muted-light);
    display: block;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 4px;
  }

  &__sub {
    font-size: 13px;
    font-weight: 400 !important;
    color: var(--muted-light);
  }
}

// ── FAB ──
.fab {
  position: fixed;
  bottom: 24px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--moss);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(107, 143, 113, 0.35);
  transition: all 0.2s ease;
  z-index: 100;

  .material-icons-outlined {
    font-size: 24px;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(107, 143, 113, 0.45);
  }
}
</style>
