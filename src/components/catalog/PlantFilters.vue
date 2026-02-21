<template>
  <div class="plant-filters q-gutter-y-sm">
    <q-input
      :model-value="search"
      :placeholder="t('catalog.searchPlaceholder')"
      dense
      outlined
      clearable
      @update:model-value="onSearchUpdate"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <div class="row q-gutter-x-sm">
      <q-btn-toggle
        :model-value="typeFilter"
        toggle-color="primary"
        no-caps
        rounded
        unelevated
        size="sm"
        :options="typeOptions"
        @update:model-value="onTypeUpdate"
      />
    </div>

    <div class="row q-gutter-x-sm items-center">
      <q-btn-toggle
        :model-value="sunFilter"
        toggle-color="amber-8"
        no-caps
        rounded
        unelevated
        size="sm"
        :options="sunOptions"
        @update:model-value="onSunUpdate"
      />

      <q-space />

      <q-toggle
        :model-value="stockOnly"
        :label="t('catalog.inStockOnly')"
        color="green-6"
        dense
        @update:model-value="onStockUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PlantType, SunRequirement } from 'src/types/plant';

defineProps<{
  search: string;
  typeFilter: PlantType | null;
  sunFilter: SunRequirement | null;
  stockOnly: boolean;
}>();

const emit = defineEmits<{
  'update:search': [value: string];
  'update:typeFilter': [value: PlantType | null];
  'update:sunFilter': [value: SunRequirement | null];
  'update:stockOnly': [value: boolean];
}>();

const { t } = useI18n();

function onSearchUpdate(val: string | number | null) {
  emit('update:search', String(val ?? ''));
}

function onTypeUpdate(val: PlantType | null) {
  emit('update:typeFilter', val);
}

function onSunUpdate(val: SunRequirement | null) {
  emit('update:sunFilter', val);
}

function onStockUpdate(val: boolean) {
  emit('update:stockOnly', val);
}

const typeOptions = computed(() => [
  { label: t('catalog.allTypes'), value: null },
  { label: t('catalog.flower'), value: 'flower' as PlantType },
  { label: t('catalog.vegetable'), value: 'vegetable' as PlantType },
  { label: t('catalog.herb'), value: 'herb' as PlantType },
]);

const sunOptions = computed(() => [
  { label: t('catalog.allSun'), value: null },
  { label: '☀️', value: 'full-sun' as SunRequirement },
  { label: '⛅', value: 'partial-shade' as SunRequirement },
  { label: '☁️', value: 'shade' as SunRequirement },
]);
</script>
