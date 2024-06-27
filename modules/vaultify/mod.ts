import type { Module } from "/hooks/index.ts";
import { createSettings, type Settings } from "/modules/official/stdlib/lib/settings.tsx";

export let settings: Settings;
export default async function (mod: Module) {
	[settings] = createSettings(mod);

	await import("./settings.ts");
}
