import i18n from "https://esm.sh/i18next";
import { initReactI18next } from "https://esm.sh/react-i18next";
import LanguageDetector from "https://esm.sh/i18next-browser-languagedetector";
import locales from "./resources/locales/index.js";
export const t = await i18n.use(initReactI18next).use(LanguageDetector).init({
    resources: locales,
    detection: {
        order: [
            "navigator",
            "htmlTag"
        ]
    },
    fallbackLng: "en",
    interpolation: {
        escapeValue: false
    }
});
