import { createSettings } from "/modules/official/stdlib/lib/settings.js";
import type { Module } from "/hooks/module.js";
import type { Settings } from "/modules/official/stdlib/lib/settings.js";
import { createEventBus, type EventBus } from "/modules/official/stdlib/index.js";

export let settings: Settings;
export let eventBus: EventBus;
export default function (mod: Module) {
	[settings] = createSettings(mod);
	eventBus = createEventBus(mod);
	import("./showTheGenres.js");
}
