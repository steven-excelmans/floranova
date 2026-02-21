<template>
  <q-page padding>
    <div v-if="!plant" class="text-center q-mt-xl text-grey-6">
      <q-icon name="error_outline" size="48px" class="q-mb-sm" />
      <div>Plant not found</div>
      <q-btn flat color="primary" label="Back" icon="arrow_back" to="/catalog" class="q-mt-md" />
    </div>

    <template v-else>
      <q-btn
        flat
        dense
        icon="arrow_back"
        color="primary"
        class="q-mb-sm"
        @click="router.back()"
      />

      <q-img
        :src="plant.imageUrl"
        :alt="displayName"
        class="rounded-borders q-mb-md"
        style="max-height: 250px"
        fit="cover"
      >
        <template #error>
          <div class="absolute-full flex flex-center bg-grey-3">
            <q-icon name="local_florist" size="64px" color="grey-5" />
          </div>
        </template>
      </q-img>

      <div class="row items-center q-gutter-x-sm q-mb-xs">
        <span class="text-h5 text-weight-bold">{{ displayName }}</span>
        <PlantTypeBadge :type="plant.type" />
      </div>

      <div class="text-subtitle2 text-grey-7 text-italic q-mb-md">
        {{ plant.latinName }}
      </div>

      <StockToggle
        :in-stock="stockStore.isInStock(plant.id)"
        @toggle="stockStore.toggleStock(plant.id)"
      />

      <q-separator class="q-my-md" />

      <!-- Calendar bars -->
      <div class="text-subtitle2 text-weight-bold q-mb-sm">
        {{ t('plant.calendar') }}
      </div>
      <div class="detail-calendar q-mb-md">
        <div class="detail-calendar__months">
          <span v-for="m in 12" :key="m" class="text-caption text-grey-6">
            {{ t(`months.${m}`) }}
          </span>
        </div>
        <div v-if="plant.calendar.indoorSowing" class="detail-calendar__row">
          <span class="text-caption">{{ t('calendar.indoorSowing') }}</span>
          <div class="detail-calendar__bars">
            <MonthRangeBar :range="plant.calendar.indoorSowing" action="indoorSowing" />
          </div>
        </div>
        <div v-if="plant.calendar.greenhouse" class="detail-calendar__row">
          <span class="text-caption">{{ t('calendar.greenhouse') }}</span>
          <div class="detail-calendar__bars">
            <MonthRangeBar :range="plant.calendar.greenhouse" action="greenhouse" />
          </div>
        </div>
        <div v-if="plant.calendar.outdoor" class="detail-calendar__row">
          <span class="text-caption">{{ t('calendar.outdoor') }}</span>
          <div class="detail-calendar__bars">
            <MonthRangeBar :range="plant.calendar.outdoor" action="outdoor" />
          </div>
        </div>
      </div>

      <!-- Details list -->
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('plant.germination') }}</q-item-label>
            <q-item-label>{{ t(`plant.${plant.germination}`) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('plant.sun') }}</q-item-label>
            <q-item-label>{{ t(`plant.${plant.sun}`) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="plant.colors.length">
          <q-item-section>
            <q-item-label caption>{{ t('plant.colors') }}</q-item-label>
            <q-item-label>{{ plant.colors.join(', ') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('plant.minDistance') }}</q-item-label>
            <q-item-label>{{ plant.minDistanceCm }} cm</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="plant.plantingConditions.length">
          <q-item-section>
            <q-item-label caption>{{ t('plant.plantingConditions') }}</q-item-label>
            <q-item-label>
              <q-chip
                v-for="cond in plant.plantingConditions"
                :key="cond"
                dense
                size="sm"
                color="grey-3"
              >
                {{ t(`plant.${cond}`) }}
              </q-chip>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>{{ t('plant.maintenance') }}</q-item-label>
            <q-item-label>{{ localize(plant.maintenanceNotes) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="plant.stemTips">
          <q-item-section>
            <q-item-label caption>{{ t('plant.stemTips') }}</q-item-label>
            <q-item-label>{{ localize(plant.stemTips) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { useStockStore } from 'src/stores/stock-store';
import { useLocale } from 'src/composables/useLocale';
import PlantTypeBadge from 'src/components/shared/PlantTypeBadge.vue';
import StockToggle from 'src/components/catalog/StockToggle.vue';
import MonthRangeBar from 'src/components/shared/MonthRangeBar.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const plantStore = usePlantStore();
const stockStore = useStockStore();
const { localize } = useLocale();

const plant = computed(() =>
  plantStore.getPlantById(route.params.id as string),
);

const displayName = computed(() =>
  plant.value ? localize(plant.value.name) : '',
);
</script>

<style scoped lang="scss">
.detail-calendar {
  &__months {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    text-align: center;
    margin-left: 120px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;

    > span {
      width: 112px;
      flex-shrink: 0;
      text-align: right;
    }
  }

  &__bars {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    align-items: center;
  }
}
</style>
