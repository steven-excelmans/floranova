import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/catalog' },
      {
        path: 'catalog',
        component: () => import('pages/CatalogPage.vue'),
      },
      {
        path: 'calendar',
        component: () => import('pages/CalendarPage.vue'),
      },
      {
        path: 'plant/:id',
        component: () => import('pages/PlantDetailPage.vue'),
      },
      {
        path: 'garden',
        component: () => import('pages/MyGardenPage.vue'),
      },
      // Admin routes (same layout, admin access checked in MainLayout)
      {
        path: 'admin',
        meta: { requiresAdmin: true },
        component: () => import('pages/admin/AdminDashboardPage.vue'),
      },
      {
        path: 'admin/plants',
        meta: { requiresAdmin: true },
        component: () => import('pages/admin/PlantListPage.vue'),
      },
      {
        path: 'admin/plants/add-names',
        meta: { requiresAdmin: true },
        component: () => import('pages/admin/AddNamesPage.vue'),
      },
      {
        path: 'admin/plants/:id',
        meta: { requiresAdmin: true },
        component: () => import('pages/admin/PlantEditorPage.vue'),
      },
      {
        path: 'admin/generate-prompt',
        meta: { requiresAdmin: true },
        component: () => import('pages/admin/GeneratePromptPage.vue'),
      },
      {
        path: 'admin/import',
        meta: { requiresAdmin: true },
        component: () => import('pages/admin/ImportDataPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
