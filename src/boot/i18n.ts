import { defineBoot } from '#q-app/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['nl'];

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineDateTimeFormat {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineNumberFormat {}
}

const STORAGE_KEY = 'floranova-locale';

function getSavedLocale(): MessageLanguages {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en-US' || saved === 'nl') return saved;
  return 'nl';
}

export default defineBoot(({ app }) => {
  const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
    locale: getSavedLocale(),
    fallbackLocale: 'nl',
    legacy: false,
    messages,
  });

  app.use(i18n);
});
