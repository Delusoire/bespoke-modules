import { createSettings, type Settings } from "/modules/official/stdlib/lib/settings.tsx";
import type { Module } from "/hooks/index.ts";
import { createEventBus, type EventBus } from "/modules/official/stdlib/index.ts";

export let settings: Settings;
export let eventBus: EventBus;
export default function (mod: Module) {
	[settings] = createSettings(mod);
	eventBus = createEventBus(mod);
	import("./showTheGenres.ts");

	return async () => {
		const { nowPlayingGenreContainerEl } = await import("./showTheGenres.ts");
		nowPlayingGenreContainerEl.remove();
	};
}
