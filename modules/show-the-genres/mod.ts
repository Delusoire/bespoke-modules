import { createSettings, type Settings } from "/modules/stdlib/lib/settings.tsx";
import type { ModuleInstance } from "/hooks/module.ts";
import { createEventBus, type EventBus } from "/modules/stdlib/mod.ts";

export let settings: Settings;
export let eventBus: EventBus;
export default function (mod: ModuleInstance) {
	[settings] = createSettings(mod);
	eventBus = createEventBus(mod);
	import("./showTheGenres.ts");

	return async () => {
		const { nowPlayingGenreContainerEl } = await import("./showTheGenres.ts");
		nowPlayingGenreContainerEl.remove();
	};
}
