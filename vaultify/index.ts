import type { ModuleInstance } from "/hooks/module.ts";
import { createSettings, type Settings } from "/modules/official/stdlib/lib/settings.tsx";

export let settings: Settings;
export default async function (mod: ModuleInstance) {
	[settings] = createSettings(mod);

	await import("./settings.ts");
}
