import { useI18n } from 'vue-i18n';
import type { BilingualText } from 'src/types/plant';

const STORAGE_KEY = 'floranova-locale';

export function useLocale() {
  const { locale } = useI18n();

  function localize(text: BilingualText): string {
    return locale.value === 'nl' ? text.nl : text.en;
  }

  function toggleLocale() {
    const next = locale.value === 'nl' ? 'en-US' : 'nl';
    locale.value = next;
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { locale, localize, toggleLocale };
}
