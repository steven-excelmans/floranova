import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuth } from 'src/composables/useAuth';

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {
    if (to.matched.some((r) => r.meta.requiresAdmin)) {
      const { isAuthenticated, isAdmin, loading } = useAuth();

      // If still loading auth state, let through (layout will handle)
      if (loading.value) return true;

      if (!isAuthenticated.value) {
        return '/catalog';
      }
      if (!isAdmin.value) {
        return '/catalog';
      }
    }
    return true;
  });

  return Router;
});
