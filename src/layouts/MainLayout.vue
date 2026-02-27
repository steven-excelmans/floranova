<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="floranova-header" :elevated="false">
      <div class="header__top">
        <div class="header__logo">floranova<span class="header__logo-dot">.</span></div>
        <LanguageToggle />
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
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageToggle from 'src/components/layout/LanguageToggle.vue';

const { t } = useI18n();
const activeTab = ref('catalog');
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
</style>
