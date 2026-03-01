<template>
  <div class="lang-selector" ref="rootEl">
    <button class="lang-btn" @click="open = !open">
      <span class="material-icons-outlined">language</span>
    </button>

    <Transition name="lang-dropdown">
      <div v-if="open" class="lang-dropdown">
        <button
          v-for="lang in languages"
          :key="lang.value"
          class="lang-option"
          :class="{ active: locale === lang.value }"
          @click="selectLocale(lang.value)"
        >
          <span class="lang-option__code">{{ lang.code }}</span>
          <span class="lang-option__label">{{ lang.label }}</span>
          <span
            v-if="locale === lang.value"
            class="material-icons-outlined lang-option__check"
          >check</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useLocale } from 'src/composables/useLocale';

const { locale, setLocale } = useLocale();

const open = ref(false);
const rootEl = ref<HTMLElement>();

const languages = [
  { value: 'nl', code: 'NL', label: 'Nederlands' },
  { value: 'en-US', code: 'EN', label: 'English' },
];

function selectLocale(value: string) {
  setLocale(value);
  open.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<style lang="scss" scoped>
.lang-selector {
  position: relative;
}

.lang-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: all 0.25s ease;
  padding: 0;

  .material-icons-outlined {
    font-size: 20px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: var(--warm-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevated);
  padding: 4px;
  z-index: 100;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-body);
  transition: background 0.2s ease;

  &:hover {
    background: var(--moss-ghost);
  }

  &.active {
    background: var(--moss-pale);
  }
}

.lang-option__code {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--deep-brown);
  width: 22px;
  flex-shrink: 0;
}

.lang-option__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-soft);
  flex: 1;
  text-align: left;
}

.lang-option__check {
  font-size: 16px;
  color: var(--moss);
  flex-shrink: 0;
}

// ── Transition ──
.lang-dropdown-enter-active,
.lang-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.lang-dropdown-enter-from,
.lang-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
