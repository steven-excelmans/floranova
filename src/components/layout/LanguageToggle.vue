<template>
  <button class="lang-toggle" @click="toggleLocale">
    {{ locale === 'nl' ? 'EN' : 'NL' }}
  </button>
</template>

<script setup lang="ts">
import { useLocale } from 'src/composables/useLocale';

const { locale, toggleLocale } = useLocale();
</script>

<style lang="scss" scoped>
.lang-toggle {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--clay);
  border: 1.5px solid var(--clay-light);
  border-radius: var(--radius-pill);
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: transparent;
  line-height: 1;

  &:hover {
    background: var(--clay);
    color: var(--warm-white);
  }
}
</style>
