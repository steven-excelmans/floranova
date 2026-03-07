<template>
  <q-page class="image-prompt-page">
    <!-- Stats bar -->
    <div class="stats-bar">
      <div class="stat stat--missing">
        <span class="stat__num">{{ missingImages.length }}</span>
        <span class="stat__label">{{ t('admin.imagesMissing') }}</span>
      </div>
      <div class="stat stat--total">
        <span class="stat__num">{{ nonPendingPlants.length }}</span>
        <span class="stat__label">{{ t('admin.imagesTotal') }}</span>
      </div>
      <div class="stat stat--done">
        <span class="stat__num">{{ withImages }}</span>
        <span class="stat__label">{{ t('admin.imagesWithImages') }}</span>
      </div>
    </div>

    <!-- Section header -->
    <div v-if="missingImages.length > 0" class="section-header">
      <span class="section-header__title">{{ t('admin.imagesMissingTitle') }}</span>
    </div>

    <!-- Plant cards -->
    <div v-if="missingImages.length > 0" class="plant-cards">
      <div v-for="plant in missingImages" :key="plant.id" class="plant-card">
        <div class="plant-card__placeholder">
          <span class="material-icons-outlined">photo_camera</span>
        </div>
        <div class="plant-card__info">
          <span class="plant-card__species"><em>{{ plant.species }}</em></span>
          <span v-if="plant.variety" class="plant-card__variety">'{{ plant.variety }}'</span>
        </div>
        <div
          class="plant-card__type"
          :class="`plant-card__type--${plant.type}`"
        >
          <span class="material-icons-outlined">{{ typeIcon(plant.type) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-hint">
      <span class="material-icons-outlined empty-hint__icon">collections</span>
      <p>{{ t('admin.imagesAllDone') }}</p>
      <p class="empty-hint__sub">{{ t('admin.imagesAllDoneSub') }}</p>
    </div>

    <!-- Action area -->
    <div v-if="missingImages.length > 0" class="action-area">
      <button class="generate-btn" @click="generate">
        <span class="material-icons-outlined">auto_awesome</span>
        {{ t('admin.imagesGenerate') }}
        <span class="generate-btn__count">{{ t('admin.imagesForCount', { count: missingImages.length }) }}</span>
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { usePromptGenerator } from 'src/composables/usePromptGenerator';
import type { PlantType } from 'src/types/plant';

const { t } = useI18n();
const plantStore = usePlantStore();
const { generateImagePrompt } = usePromptGenerator();

const generatedPrompt = ref('');
const copied = ref(false);

const nonPendingPlants = computed(() =>
  plantStore.plants.filter((p) => p.status !== 'pending'),
);

const missingImages = computed(() =>
  nonPendingPlants.value.filter((p) => !p.images || p.images.length === 0),
);

const withImages = computed(() =>
  nonPendingPlants.value.filter((p) => p.images && p.images.length > 0).length,
);

function typeIcon(type: PlantType) {
  if (type === 'flower') return 'local_florist';
  if (type === 'herb') return 'grass';
  return 'spa';
}

function generate() {
  generatedPrompt.value = generateImagePrompt(missingImages.value);
}

async function copyPrompt() {
  await navigator.clipboard.writeText(generatedPrompt.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<style lang="scss" scoped>
.image-prompt-page {
  padding: 12px 16px 100px;
  overflow-x: hidden;
}

// ── Stats bar ──
.stats-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: var(--warm-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: 18px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 8px;
  position: relative;

  & + & {
    border-left: 1px solid var(--border-light);
  }

  &__num {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }

  &__label {
    font-size: 10.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  &--missing {
    .stat__num { color: var(--clay); }
    .stat__label { color: var(--clay-light); }
  }

  &--total {
    .stat__num { color: var(--deep-brown); }
    .stat__label { color: var(--muted-light); }
  }

  &--done {
    .stat__num { color: var(--moss); }
    .stat__label { color: var(--moss-light); }
  }
}

// ── Section header ──
.section-header {
  margin-bottom: 10px;

  &__title {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--ink-soft);
  }
}

// ── Plant cards ──
.plant-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.plant-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--warm-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  box-shadow: var(--shadow-soft);

  &__placeholder {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: var(--radius-sm);
    border: 1.5px dashed var(--border);
    background: linear-gradient(180deg, var(--sand) 0%, #F0EAE0 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .material-icons-outlined {
      font-size: 20px;
      color: var(--clay-light);
      opacity: 0.5;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__species {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--deep-brown);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__variety {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.3;
  }

  &__type {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .material-icons-outlined {
      font-size: 16px;
    }

    &--flower {
      background: var(--flower-bg);
      color: var(--flower);
    }

    &--herb {
      background: var(--herb-bg);
      color: var(--herb);
    }

    &--vegetable {
      background: var(--veg-bg);
      color: var(--veg);
    }
  }
}

// ── Action area ──
.action-area {
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

  &__count {
    font-weight: 400;
    opacity: 0.85;
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
</style>
