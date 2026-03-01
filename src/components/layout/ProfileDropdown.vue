<template>
  <div v-if="isAuthenticated || loading" ref="rootEl" class="profile-selector">
    <button class="profile-btn" @click="open = !open">
      <img
        v-if="photoSrc"
        :src="photoSrc"
        :alt="user?.displayName ?? ''"
        referrerpolicy="no-referrer"
        class="profile-btn__avatar"
      />
      <span v-else class="material-icons-outlined">account_circle</span>
    </button>

    <Transition name="profile-dropdown">
      <div v-if="open" class="profile-dropdown">
        <div class="profile-dropdown__header">
          <img
            v-if="photoSrc"
            :src="photoSrc"
            referrerpolicy="no-referrer"
            class="profile-dropdown__photo"
          />
          <div class="profile-dropdown__info">
            <span class="profile-dropdown__name">{{ user?.displayName }}</span>
            <span class="profile-dropdown__email">{{ user?.email }}</span>
          </div>
        </div>
        <div class="profile-dropdown__divider" />
        <router-link
          v-if="isAdmin"
          to="/admin"
          class="profile-dropdown__item"
          @click="open = false"
        >
          <span class="material-icons-outlined">admin_panel_settings</span>
          Admin
          <span class="profile-dropdown__badge">Admin</span>
        </router-link>
        <button class="profile-dropdown__item profile-dropdown__item--danger" @click="handleSignOut">
          <span class="material-icons-outlined">logout</span>
          {{ t('auth.signOut') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from 'src/composables/useAuth';

const PHOTO_CACHE_KEY = 'floranova_profile_photo';

const { t } = useI18n();
const route = useRoute();
const { user, isAuthenticated, isAdmin, loading, signOut } = useAuth();

const open = ref(false);
const rootEl = ref<HTMLElement>();
const photoSrc = ref(localStorage.getItem(PHOTO_CACHE_KEY) ?? '');

async function cachePhoto(url: string) {
  try {
    const res = await fetch(url, { referrerPolicy: 'no-referrer' });
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem(PHOTO_CACHE_KEY, dataUrl);
      photoSrc.value = dataUrl;
    };
    reader.readAsDataURL(blob);
  } catch {
    // Fall back to the raw URL if fetch fails
    photoSrc.value = url;
  }
}

watch(
  () => user.value?.photoURL,
  (url) => {
    if (url) {
      // Re-cache if URL changed or no cache yet
      const cached = localStorage.getItem(PHOTO_CACHE_KEY);
      if (!cached) void cachePhoto(url);
      else photoSrc.value = cached;
    } else {
      photoSrc.value = '';
      localStorage.removeItem(PHOTO_CACHE_KEY);
    }
  },
  { immediate: true },
);

function handleSignOut() {
  open.value = false;
  localStorage.removeItem(PHOTO_CACHE_KEY);
  photoSrc.value = '';
  void signOut();
}

function onClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));

watch(
  () => route.path,
  () => {
    open.value = false;
  },
);
</script>

<style lang="scss" scoped>
.profile-selector {
  position: relative;
}

.profile-btn {
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
  overflow: hidden;

  .material-icons-outlined {
    font-size: 22px;
  }

  &:hover {
    border-color: var(--clay-light);
    color: var(--deep-brown);
  }
}

.profile-btn__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* ── Profile dropdown ── */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: var(--warm-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevated);
  padding: 4px;
  z-index: 100;
}

.profile-dropdown__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 10px;
}

.profile-dropdown__photo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.profile-dropdown__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profile-dropdown__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--deep-brown);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-dropdown__email {
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-dropdown__divider {
  height: 1px;
  margin: 2px 8px;
  background: var(--border-light);
}

.profile-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-soft);
  text-decoration: none;
  transition: background 0.2s ease;

  .material-icons-outlined {
    font-size: 18px;
    color: var(--muted);
  }

  &:hover {
    background: var(--moss-ghost);
  }

  &--danger {
    color: var(--overdue);

    .material-icons-outlined {
      color: var(--overdue);
    }

    &:hover {
      background: var(--overdue-bg);
    }
  }
}

.profile-dropdown__badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--clay);
  background: var(--clay-pale);
  padding: 2px 7px;
  border-radius: var(--radius-pill);
}

/* ── Transition ── */
.profile-dropdown-enter-active,
.profile-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.profile-dropdown-enter-from,
.profile-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
