<template>
  <q-card
    flat
    bordered
    class="plant-card cursor-pointer"
    @click="$emit('select', plant.id)"
  >
    <q-card-section horizontal>
      <q-img
        :src="plant.imageUrl"
        :alt="displayName"
        class="plant-card__image"
        fit="cover"
        loading="lazy"
      >
        <template #error>
          <div class="absolute-full flex flex-center bg-grey-3">
            <q-icon name="local_florist" size="32px" color="grey-5" />
          </div>
        </template>
      </q-img>

      <q-card-section class="plant-card__content q-py-sm">
        <div class="row items-center q-gutter-x-xs q-mb-xs">
          <span class="text-subtitle2 text-weight-bold">{{ displayName }}</span>
          <PlantTypeBadge :type="plant.type" />
        </div>

        <div v-if="plant.variety" class="text-caption text-grey-7">
          {{ plant.latinName }}
        </div>

        <div class="row items-center q-mt-xs">
          <q-icon
            :name="sunIcon"
            size="18px"
            :color="sunColor"
            class="q-mr-xs"
          />
          <span class="text-caption text-grey-7">{{ t(`plant.${plant.sun}`) }}</span>
        </div>

        <div class="q-mt-xs" @click.stop>
          <StockToggle
            :in-stock="inStock"
            @toggle="$emit('toggle-stock', plant.id)"
          />
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Plant } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';
import PlantTypeBadge from 'src/components/shared/PlantTypeBadge.vue';
import StockToggle from './StockToggle.vue';

const props = defineProps<{
  plant: Plant;
  inStock: boolean;
}>();

defineEmits<{
  select: [id: string];
  'toggle-stock': [id: string];
}>();

const { t } = useI18n();
const { localize } = useLocale();

const displayName = computed(() => localize(props.plant.name));

const sunIconMap: Record<string, string> = {
  'full-sun': 'wb_sunny',
  'partial-shade': 'wb_cloudy',
  shade: 'cloud',
};

const sunColorMap: Record<string, string> = {
  'full-sun': 'amber-8',
  'partial-shade': 'blue-grey-5',
  shade: 'grey-6',
};

const sunIcon = computed(() => sunIconMap[props.plant.sun]);
const sunColor = computed(() => sunColorMap[props.plant.sun]);
</script>

<style scoped lang="scss">
.plant-card__image {
  width: 100px;
  min-height: 100px;
}

.plant-card__content {
  flex: 1;
  min-width: 0;
}
</style>
