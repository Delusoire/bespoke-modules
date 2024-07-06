import type { ResourceLanguage } from "https://esm.sh/v135/i18next";
import { fetchJson } from "/hooks/util.ts";

export default {
	en: await fetchJson<ResourceLanguage>("/modules/Delusoire.marketplace/src/resources/locales/en.json"),
};
