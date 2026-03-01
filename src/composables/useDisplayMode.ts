import { ref } from 'vue';

const isStandalone = ref(false);

function check() {
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
}

let initialized = false;
let mediaQuery: MediaQueryList | null = null;

export function useDisplayMode() {
  if (!initialized) {
    initialized = true;
    check();
    mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', check);
  }

  return { isStandalone };
}
