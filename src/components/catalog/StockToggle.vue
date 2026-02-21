<template>
  <q-toggle
    :model-value="inStock"
    :label="inStock ? t('stock.inStock') : t('stock.notInStock')"
    color="green-6"
    @update:model-value="$emit('toggle')"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ inStock: boolean }>();
defineEmits<{ toggle: [] }>();

const { t } = useI18n();
</script>
