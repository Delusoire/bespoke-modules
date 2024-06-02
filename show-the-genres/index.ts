import { createSettings, type Settings } from "/modules/official/stdlib/lib/settings.tsx";
import type { ModuleInstance } from "/hooks/module.ts";
import { createEventBus, type EventBus } from "/modules/official/stdlib/index.ts";

export let settings: Settings;
export let eventBus: EventBus;
export default function (mod: ModuleInstance) {
	[settings] = createSettings(mod);
	eventBus = createEventBus(mod);
	import("./showTheGenres.ts");
}
