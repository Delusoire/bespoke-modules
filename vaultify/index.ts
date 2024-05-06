import type { Module } from "/hooks/module.js";
import type { Settings } from "/modules/official/stdlib/lib/settings.js";

import { createSettings } from "/modules/official/stdlib/lib/settings.js";

export let settings: Settings;
export default async function (mod: Module) {
	[settings] = createSettings(mod);

	await import("./settings.js");
}
