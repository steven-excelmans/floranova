<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          Floranova
        </q-toolbar-title>
        <LanguageToggle />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-white text-primary">
      <q-tabs
        v-model="activeTab"
        dense
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-route-tab
          name="catalog"
          icon="local_florist"
          :label="t('nav.catalog')"
          to="/catalog"
          exact
        />
        <q-route-tab
          name="calendar"
          icon="calendar_month"
          :label="t('nav.calendar')"
          to="/calendar"
          exact
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageToggle from 'src/components/layout/LanguageToggle.vue';

const { t } = useI18n();
const activeTab = ref('catalog');
</script>
