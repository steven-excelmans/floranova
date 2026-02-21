<template>
  <q-btn
    flat
    dense
    round
    :label="locale === 'nl' ? 'EN' : 'NL'"
    @click="toggleLocale"
  />
</template>

<script setup lang="ts">
import { useLocale } from 'src/composables/useLocale';

const { locale, toggleLocale } = useLocale();
</script>
