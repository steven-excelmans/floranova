/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import type { WorkboxPlugin } from 'workbox-core/types';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: { url: string; revision: string | null }[];
};

// Precache app shell (injected by Quasar/Workbox build)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache Wikimedia Commons images with CacheFirst strategy
registerRoute(
  ({ url }: { url: URL }) => url.hostname.includes('wikimedia.org'),
  new CacheFirst({
    cacheName: 'plant-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }) as WorkboxPlugin,
    ],
  }),
);

// Listen for skip waiting message
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if ((event.data as { type?: string })?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});
