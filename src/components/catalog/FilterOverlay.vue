<template>
  <Teleport to="body">
    <Transition name="filter-overlay">
      <div v-if="open" class="filter-overlay">
        <div class="filter-overlay__backdrop" @click="$emit('close')" />
        <div class="filter-overlay__panel" :style="{ top: headerHeight + 'px' }">
          <PlantFilters
            :search="plantStore.search"
            :type-filter="plantStore.typeFilter"
            :sun-filter="plantStore.sunFilter"
            :stock-only="plantStore.stockOnly"
            @update:search="plantStore.search = $event"
            @update:type-filter="plantStore.typeFilter = $event"
            @update:sun-filter="plantStore.sunFilter = $event"
            @update:stock-only="plantStore.stockOnly = $event"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { usePlantStore } from 'src/stores/plant-store';
import PlantFilters from './PlantFilters.vue';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const plantStore = usePlantStore();
const headerHeight = ref(0);

function measureHeader() {
  const header = document.querySelector('.q-header');
  if (header) headerHeight.value = header.getBoundingClientRect().height;
}

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => {
  measureHeader();
  window.addEventListener('resize', measureHeader);
  document.addEventListener('keydown', onEscape);
});

onUnmounted(() => {
  window.removeEventListener('resize', measureHeader);
  document.removeEventListener('keydown', onEscape);
});
</script>

<style lang="scss">
.filter-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
}

.filter-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(53, 43, 34, 0.15);
}

.filter-overlay__panel {
  position: absolute;
  left: 0;
  right: 0;
  background: var(--warm-white);
  border-radius: 0 0 var(--radius-card) var(--radius-card);
  box-shadow: var(--shadow-elevated);
  padding-top: 14px;
}

// ── Transition ──
.filter-overlay-enter-active,
.filter-overlay-leave-active {
  transition: opacity 0.25s ease;

  .filter-overlay__panel {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
}

.filter-overlay-enter-from,
.filter-overlay-leave-to {
  opacity: 0;

  .filter-overlay__panel {
    transform: translateY(-10px);
    opacity: 0;
  }
}
</style>
