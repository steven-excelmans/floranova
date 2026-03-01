<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="admin-header" :elevated="false">
      <div class="admin-header__top">
        <div class="admin-header__brand">
          <router-link to="/catalog" class="admin-header__logo">floranova<span class="admin-header__logo-dot">.</span></router-link>
          <span class="admin-header__badge">Admin</span>
        </div>
        <div class="admin-header__right">
          <LanguageToggle />
          <ProfileDropdown />
        </div>
      </div>
      <nav class="admin-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="admin-nav__item"
          :class="{ 'admin-nav__item--active': isActive(item.to) }"
        >
          <span class="material-icons-outlined admin-nav__icon">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>
    </q-header>

    <q-page-container>
      <router-view v-if="isAdmin" />
      <q-page v-else class="admin-denied">
        <div class="admin-denied__inner">
          <span class="material-icons-outlined admin-denied__icon">lock</span>
          <p>Admin access required</p>
          <router-link to="/catalog" class="admin-denied__link">Back to app</router-link>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAuth } from 'src/composables/useAuth';
import LanguageToggle from 'src/components/layout/LanguageToggle.vue';
import ProfileDropdown from 'src/components/layout/ProfileDropdown.vue';

const route = useRoute();
const { isAdmin } = useAuth();

const navItems = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/plants', icon: 'eco', label: 'Plants' },
  { to: '/admin/plants/add-names', icon: 'add_circle', label: 'Add Names' },
  { to: '/admin/generate-prompt', icon: 'auto_awesome', label: 'Prompt' },
  { to: '/admin/import', icon: 'upload', label: 'Import' },
];

function isActive(to: string) {
  // Find the longest (most specific) matching nav item
  const bestMatch = navItems
    .filter((item) => route.path === item.to || route.path.startsWith(item.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return bestMatch?.to === to;
}
</script>

<style lang="scss" scoped>
.admin-header {
  background: var(--warm-white) !important;
  box-shadow: none !important;
  border-bottom: 1px solid var(--border-light);
}

.admin-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
}

.admin-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-header__logo {
  font-family: var(--font-logo);
  font-size: 20px;
  font-weight: 800;
  color: var(--deep-brown);
  letter-spacing: -0.5px;
  text-decoration: none;
  line-height: 1;
}

.admin-header__logo-dot {
  color: var(--moss);
}

.admin-header__badge {
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

.admin-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-nav {
  display: flex;
  gap: 2px;
  padding: 0 16px 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.admin-nav__item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    color: var(--deep-brown);
  }

  &--active {
    color: var(--clay);
    border-bottom-color: var(--clay);
    font-weight: 600;
  }
}

.admin-nav__icon {
  font-size: 16px;
}

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
