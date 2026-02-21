<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn-toggle
        v-model="viewMode"
        toggle-color="primary"
        no-caps
        rounded
        unelevated
        :options="[
          { label: t('calendar.timeline'), value: 'timeline' },
          { label: t('calendar.monthly'), value: 'monthly' },
        ]"
      />

      <q-space />

      <q-toggle
        v-model="stockOnly"
        :label="t('calendar.inStockOnly')"
        color="green-6"
        dense
      />
    </div>

    <TimelineView v-if="viewMode === 'timeline'" :plants="visiblePlants" />

    <MonthlyView
      v-else
      :plants="visiblePlants"
      @select="router.push(`/plant/${$event}`)"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { useStockStore } from 'src/stores/stock-store';
import TimelineView from 'src/components/calendar/TimelineView.vue';
import MonthlyView from 'src/components/calendar/MonthlyView.vue';

const { t } = useI18n();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();

const viewMode = ref<'timeline' | 'monthly'>('monthly');
const stockOnly = ref(false);

const visiblePlants = computed(() => {
  if (!stockOnly.value) return plantStore.plants;
  return plantStore.plants.filter((p) => stockStore.isInStock(p.id));
});
</script>
