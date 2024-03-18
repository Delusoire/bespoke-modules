import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";
import type { Module } from "/hooks/module.js";
import type { Settings } from "/modules/Delusoire/stdlib/lib/settings.js";
import { createEventBus, type EventBus } from "/modules/Delusoire/stdlib/index.js";

export let settings: Settings;
export let eventBus: EventBus;
export default function (mod: Module) {
	[settings] = createSettings(mod);
	eventBus = createEventBus(mod);
	import("./showTheGenres.js");
}
