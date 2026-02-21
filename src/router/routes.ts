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
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
