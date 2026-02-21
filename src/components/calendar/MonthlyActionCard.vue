<template>
  <q-item clickable @click="$emit('select', plant.id)">
    <q-item-section avatar>
      <q-avatar size="40px" rounded>
        <q-img :src="plant.imageUrl" :alt="displayName" fit="cover">
          <template #error>
            <div class="absolute-full flex flex-center bg-grey-3">
              <q-icon name="local_florist" size="20px" color="grey-5" />
            </div>
          </template>
        </q-img>
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ displayName }}</q-item-label>
      <q-item-label caption>{{ plant.latinName }}</q-item-label>
    </q-item-section>

    <q-item-section side>
      <PlantTypeBadge :type="plant.type" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plant } from 'src/types/plant';
import { useLocale } from 'src/composables/useLocale';
import PlantTypeBadge from 'src/components/shared/PlantTypeBadge.vue';

const props = defineProps<{ plant: Plant }>();
defineEmits<{ select: [id: string] }>();

const { localize } = useLocale();
const displayName = computed(() => localize(props.plant.name));
</script>
