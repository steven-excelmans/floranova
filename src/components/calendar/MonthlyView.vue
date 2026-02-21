<template>
  <div>
    <!-- Month selector -->
    <div class="row justify-center q-mb-md">
      <q-btn-toggle
        v-model="selectedMonth"
        toggle-color="primary"
        no-caps
        rounded
        unelevated
        size="sm"
        spread
        :options="monthOptions"
        class="month-toggle"
      />
    </div>

    <!-- Indoor Sowing -->
    <div v-if="indoorPlants.length" class="q-mb-md">
      <div class="text-subtitle2 text-weight-bold q-mb-xs" style="color: #42a5f5">
        {{ t('calendar.indoorSowing') }}
      </div>
      <q-list bordered separator class="rounded-borders">
        <MonthlyActionCard
          v-for="plant in indoorPlants"
          :key="plant.id"
          :plant="plant"
          @select="$emit('select', $event)"
        />
      </q-list>
    </div>

    <!-- Greenhouse -->
    <div v-if="greenhousePlants.length" class="q-mb-md">
      <div class="text-subtitle2 text-weight-bold q-mb-xs" style="color: #ff9800">
        {{ t('calendar.greenhouse') }}
      </div>
      <q-list bordered separator class="rounded-borders">
        <MonthlyActionCard
          v-for="plant in greenhousePlants"
          :key="plant.id"
          :plant="plant"
          @select="$emit('select', $event)"
        />
      </q-list>
    </div>

    <!-- Outdoor -->
    <div v-if="outdoorPlants.length" class="q-mb-md">
      <div class="text-subtitle2 text-weight-bold q-mb-xs" style="color: #66bb6a">
        {{ t('calendar.outdoor') }}
      </div>
      <q-list bordered separator class="rounded-borders">
        <MonthlyActionCard
          v-for="plant in outdoorPlants"
          :key="plant.id"
          :plant="plant"
          @select="$emit('select', $event)"
        />
      </q-list>
    </div>

    <!-- Empty state -->
    <div
      v-if="!indoorPlants.length && !greenhousePlants.length && !outdoorPlants.length"
      class="text-center q-pa-xl text-grey-6"
    >
      <q-icon name="event_busy" size="48px" class="q-mb-sm" />
      <div>{{ t('calendar.nothingToDo') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Plant } from 'src/types/plant';
import { getPlantsForMonth, getCurrentMonth } from 'src/composables/useCalendar';
import MonthlyActionCard from './MonthlyActionCard.vue';

const props = defineProps<{ plants: Plant[] }>();
defineEmits<{ select: [id: string] }>();

const { t } = useI18n();
const selectedMonth = ref(getCurrentMonth());

const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    label: t(`months.${i + 1}`),
    value: i + 1,
  })),
);

const indoorPlants = computed(() =>
  getPlantsForMonth(props.plants, selectedMonth.value, 'indoorSowing'),
);

const greenhousePlants = computed(() =>
  getPlantsForMonth(props.plants, selectedMonth.value, 'greenhouse'),
);

const outdoorPlants = computed(() =>
  getPlantsForMonth(props.plants, selectedMonth.value, 'outdoor'),
);
</script>

<style scoped lang="scss">
.month-toggle {
  flex-wrap: wrap;
}
</style>
