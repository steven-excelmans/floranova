<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="floranova-header" :class="{ 'floranova-header--admin': isAdminSection }" :elevated="false">
      <div class="header__top">
        <div class="header__brand">
          <router-link v-if="isAdminSection" to="/catalog" class="header__logo">floranova<span class="header__logo-dot">.</span></router-link>
          <div v-else class="header__logo">floranova<span class="header__logo-dot">.</span></div>
          <span v-if="isAdminSection" class="header__admin-badge">{{ t('admin.title') }}</span>
        </div>
        <div class="header__actions">
          <LanguageToggle />
          <!-- Sign in -->
          <button v-if="!isAuthenticated && !authLoading" class="header-btn" @click="handleSignIn">
            <span class="material-icons-outlined">person_outline</span>
          </button>
          <!-- Profile dropdown -->
          <ProfileDropdown />
        </div>
      </div>

      <!-- Browser mode: top navigation -->
      <nav v-if="!isStandalone" class="browser-nav">
        <router-link
          v-for="item in currentNavItems"
          :key="item.to"
          :to="item.to"
          class="browser-nav__item"
          :class="{
            'browser-nav__item--active': isAdminSection ? isAdminNavActive(item.to) : route.path === item.to,
            'browser-nav__item--admin': isAdminSection,
          }"
          @click="scrollTopIfActive(item.to)"
        >
          <span class="material-icons-outlined browser-nav__icon">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>
    </q-header>

    <q-page-container>
      <template v-if="isAdminSection && !isAdmin">
        <q-page class="admin-denied">
          <div class="admin-denied__inner">
            <span class="material-icons-outlined admin-denied__icon">lock</span>
            <p>{{ t('admin.adminRequired') }}</p>
            <router-link to="/catalog" class="admin-denied__link">{{ t('admin.backToApp') }}</router-link>
          </div>
        </q-page>
      </template>
      <router-view v-else />
    </q-page-container>

    <!-- PWA standalone mode: bottom tab bar -->
    <q-footer v-if="isStandalone && !isAdminSection" :elevated="false">
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
          @click="scrollTopIfActive('/catalog')"
        />
        <q-route-tab
          name="calendar"
          icon="o_calendar_month"
          :label="t('nav.calendar')"
          to="/calendar"
          exact
          @click="scrollTopIfActive('/calendar')"
        />
        <q-route-tab
          name="garden"
          icon="o_yard"
          :label="t('nav.garden')"
          to="/garden"
          exact
          @click="scrollTopIfActive('/garden')"
        />
      </q-tabs>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from 'src/composables/useAuth';
import { useDisplayMode } from 'src/composables/useDisplayMode';
import LanguageToggle from 'src/components/layout/LanguageToggle.vue';
import ProfileDropdown from 'src/components/layout/ProfileDropdown.vue';

const { t } = useI18n();
const route = useRoute();
const { isAuthenticated, isAdmin, loading: authLoading, signIn } = useAuth();
const { isStandalone } = useDisplayMode();

const activeTab = ref('catalog');

const isAdminSection = computed(() => route.path.startsWith('/admin'));

const appNavItems = computed(() => [
  { to: '/catalog', icon: 'eco', label: t('nav.catalog') },
  { to: '/calendar', icon: 'calendar_month', label: t('nav.calendar') },
  { to: '/garden', icon: 'yard', label: t('nav.garden') },
]);

const adminNavItems = computed(() => [
  { to: '/admin', icon: 'dashboard', label: t('admin.dashboard') },
  { to: '/admin/plants', icon: 'eco', label: t('admin.plants') },
  { to: '/admin/plants/add-names', icon: 'add_circle', label: t('admin.addNames') },
  { to: '/admin/generate-prompt', icon: 'auto_awesome', label: t('admin.generatePrompt') },
  { to: '/admin/import', icon: 'upload', label: t('admin.import') },
]);

const currentNavItems = computed(() => (isAdminSection.value ? adminNavItems.value : appNavItems.value));

function isAdminNavActive(to: string) {
  const bestMatch = adminNavItems.value
    .filter((item) => route.path === item.to || route.path.startsWith(item.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return bestMatch?.to === to;
}

function scrollTopIfActive(path: string) {
  if (route.path === path) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handleSignIn() {
  void signIn();
}

</script>

<style lang="scss" scoped>
.floranova-header {
  background: var(--warm-white) !important;
  box-shadow: none !important;

  &--admin {
    border-bottom: 1px solid var(--border-light);
  }
}

.header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header__logo {
  font-family: var(--font-logo);
  font-size: 20px;
  font-weight: 800;
  color: var(--deep-brown);
  letter-spacing: -0.5px;
  line-height: 1;
  text-decoration: none;
}

.header__logo-dot {
  color: var(--moss);
}

.header__admin-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--clay);
  background: var(--clay-pale);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  transform: translateY(2px);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Shared header button ── */
.header-btn {
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
  padding: 0;

  .material-icons-outlined {
    font-size: 20px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }
}

.header-btn__dot {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--clay);
  border: 2px solid var(--warm-white);
}

/* ── Browser top navigation ── */
.browser-nav {
  display: flex;
  gap: 2px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.browser-nav__item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--muted);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: var(--deep-brown);
  }

  &--active {
    color: var(--moss);
    border-bottom-color: var(--moss);
  }

  &--admin.browser-nav__item--active {
    color: var(--clay);
    border-bottom-color: var(--clay);
  }
}

.browser-nav__icon {
  font-size: 16px;
}

/* ── Admin denied ── */
.admin-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;

  &__inner {
    text-align: center;
  }

  &__icon {
    font-size: 48px;
    color: var(--muted-light);
    display: block;
    margin-bottom: 12px;
  }

  &__link {
    display: inline-block;
    margin-top: 16px;
    padding: 10px 20px;
    border-radius: var(--radius-pill);
    background: var(--moss-pale);
    color: var(--moss);
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
