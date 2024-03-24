import { render } from "https://esm.sh/lit";

import { PermanentMutationObserver } from "/modules/Delusoire/delulib/lib/util.js";

import type { Module } from "/hooks/module.js";
import { createEventBus, type EventBus } from "/modules/Delusoire/stdlib/index.js";

export let eventBus: EventBus;
export default async function (mod: Module) {
	eventBus = createEventBus(mod);

	const { Player } = await import("./src/utils/Player.js");
	const { LyricsWrapper } = await import("./src/components/components.js");

	const injectLyrics = (insertSelector: string, scrollSelector: string) => () => {
		const lyricsContainer = document.querySelector<HTMLDivElement>(insertSelector);
		if (!lyricsContainer || lyricsContainer.classList.contains("injected")) return;
		lyricsContainer.classList.add("injected");
		const lyricsContainerClone = lyricsContainer.cloneNode(false) as typeof lyricsContainer;
		lyricsContainer.replaceWith(lyricsContainerClone);

		const ourLyricsContainer = new LyricsWrapper(scrollSelector);
		Player.stateSubject.subscribe(state => ourLyricsContainer.updateState(state));
		Player.progressPercentSubject.subscribe(progress => ourLyricsContainer.updateProgress(progress));
		render(ourLyricsContainer, lyricsContainerClone);
	};

	const injectNPVLyrics = injectLyrics("aside .main-nowPlayingView-lyricsContent", "aside .main-nowPlayingView-lyricsContent");
	const injectCinemaLyrics = injectLyrics(
		"#lyrics-cinema .lyrics-lyrics-contentWrapper",
		"#lyrics-cinema .os-viewport-native-scrollbars-invisible",
	);

	injectNPVLyrics();
	injectCinemaLyrics();

	new PermanentMutationObserver(mod, ".Root__right-sidebar", injectNPVLyrics);
	new PermanentMutationObserver(mod, ".Root__lyrics-cinema", injectCinemaLyrics);
}
