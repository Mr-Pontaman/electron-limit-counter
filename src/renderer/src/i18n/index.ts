import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";
import es from "./locales/es.json";
import de from "./locales/de.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ja: { translation: ja },
      zh: { translation: zh },
      es: { translation: es },
      de: { translation: de }
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["navigator"],
      caches: []
    }
  });

export default i18n;
