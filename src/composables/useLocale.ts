import { useI18n } from 'vue-i18n';
import type { BilingualText } from 'src/types/plant';

const STORAGE_KEY = 'floranova-locale';

export function useLocale() {
  const { locale } = useI18n();

  function localize(text: BilingualText): string {
    return locale.value === 'nl' ? text.nl : text.en;
  }

  function setLocale(value: string) {
    locale.value = value;
    localStorage.setItem(STORAGE_KEY, value);
  }

  function toggleLocale() {
    setLocale(locale.value === 'nl' ? 'en-US' : 'nl');
  }

  return { locale, localize, setLocale, toggleLocale };
}
