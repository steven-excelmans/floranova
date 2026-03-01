<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="floranova-header" :elevated="false">
      <div class="header__top">
        <div class="header__logo">floranova<span class="header__logo-dot">.</span></div>
        <div class="header__actions">
          <LanguageToggle />
          <button v-if="isCatalog" class="filter-btn" @click="filterOpen = !filterOpen">
            <span class="material-icons-outlined">tune</span>
            <span v-if="plantStore.hasActiveFilter" class="filter-btn__dot" />
          </button>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer :elevated="false">
      <q-tabs
        v-model="activeTab"
        dense
        narrow-indicator
        switch-indicator
        inline-label
        indicator-color="primary"
      >
        <q-route-tab
          name="catalog"
          icon="o_eco"
          :label="t('nav.catalog')"
          to="/catalog"
          exact
        />
        <q-route-tab
          name="calendar"
          icon="o_calendar_month"
          :label="t('nav.calendar')"
          to="/calendar"
          exact
        />
        <q-route-tab
          name="garden"
          icon="o_yard"
          :label="t('nav.garden')"
          to="/garden"
          exact
        />
      </q-tabs>
    </q-footer>

    <FilterOverlay :open="filterOpen" @close="filterOpen = false" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import LanguageToggle from 'src/components/layout/LanguageToggle.vue';
import FilterOverlay from 'src/components/catalog/FilterOverlay.vue';

const { t } = useI18n();
const route = useRoute();
const plantStore = usePlantStore();

const activeTab = ref('catalog');
const filterOpen = ref(false);

const isCatalog = computed(() => route.path === '/catalog');

watch(
  () => route.path,
  () => {
    filterOpen.value = false;
  },
);
</script>

<style lang="scss" scoped>
.floranova-header {
  background: var(--warm-white) !important;
  box-shadow: none !important;
}

.header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
}

.header__logo {
  font-family: var(--font-logo);
  font-size: 20px;
  font-weight: 800;
  color: var(--deep-brown);
  letter-spacing: -0.5px;
  line-height: 1;
}

.header__logo-dot {
  color: var(--moss);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: all 0.25s ease;

  .material-icons-outlined {
    font-size: 20px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }
}

.filter-btn__dot {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--clay);
  border: 1.5px solid var(--warm-white);
}
</style>
