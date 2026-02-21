<template>
  <q-badge
    :color="badgeColor"
    :label="t(`catalog.${type}`)"
    rounded
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PlantType } from 'src/types/plant';

const props = defineProps<{ type: PlantType }>();
const { t } = useI18n();

const colorMap: Record<string, string> = {
  flower: 'pink-4',
  vegetable: 'green-6',
  herb: 'teal-5',
};

const badgeColor = computed(() => colorMap[props.type]);
</script>
