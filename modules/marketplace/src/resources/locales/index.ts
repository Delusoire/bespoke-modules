import type { ResourceLanguage } from "https://esm.sh/v135/i18next";

const j = <R>(path: string) =>
	import(path, { with: { type: "json" } }).then((m) => m.default).catch(() => null) as Promise<Awaited<R>>;

export default {
	en: await j("./en.json"),
} as Record<string, ResourceLanguage>;
