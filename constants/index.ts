import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ΠΡΟΣΟΧΗ: Βεβαιώσου ότι τα paths είναι σωστά. 
// Αν το αρχείο index.ts είναι ΜΕΣΑ στον φάκελο i18n, τότε το path είναι './locales/...'
import alb from './i18n/locales/alb.json';
import bg from './i18n/locales/bg.json';
import el from './i18n/locales/el.json';
import en from './i18n/locales/en.json';
import it from './i18n/locales/it.json';

const resources = {
  en: { translation: en },
  el: { translation: el },
  alb: { translation: alb },
  it: { translation: it },
  bg: { translation: bg },
};

// 1. Σύγχρονη αρχικοποίηση με τη γλώσσα της συσκευής ως προεπιλογή
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()?.[0]?.languageCode ?? 'en',
    fallbackLng: 'el',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4', // Σημαντικό για React Native
  });

// 2. Φόρτωση της αποθηκευμένης γλώσσας "στο παρασκήνιο"
AsyncStorage.getItem('user-language').then((savedLanguage) => {
  if (savedLanguage && savedLanguage !== i18n.language) {
    i18n.changeLanguage(savedLanguage);
  }
});

export default i18n;