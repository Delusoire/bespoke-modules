import { fetchJSON } from "/hooks/util.js";
export default {
    en: await fetchJSON("/modules/Delusoire/marketplace/src/resources/locales/en.json")
};
