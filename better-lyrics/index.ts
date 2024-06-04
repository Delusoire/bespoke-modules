import { render } from "https://esm.sh/lit";

import { PermanentMutationObserver } from "/modules/Delusoire/delulib/lib/util.ts";

import { createEventBus, type EventBus } from "/modules/official/stdlib/index.ts";
import { ModuleInstance } from "/hooks/module.ts";

export let eventBus: EventBus;
export default async function (mod: ModuleInstance) {
	eventBus = createEventBus(mod);

	const { Player } = await import("./src/utils/Player.ts");
	const { LyricsWrapper } = await import("./src/components/components.ts");

	const injectLyrics = (insertSelector: string, scrollSelector: string) => () => {
		const lyricsContainer = document.querySelector<HTMLElement>(insertSelector);
		if (!lyricsContainer || lyricsContainer.classList.contains("injected")) return;
		lyricsContainer.classList.add("injected");
		const lyricsContainerClone = lyricsContainer.cloneNode(false) as typeof lyricsContainer;
		lyricsContainer.replaceWith(lyricsContainerClone);

		const ourLyricsContainer = new LyricsWrapper(scrollSelector);
		Player.stateSubject.subscribe((state) => ourLyricsContainer.updateState(state));
		Player.progressPercentSubject.subscribe((progress) => ourLyricsContainer.updateProgress(progress));
		render(ourLyricsContainer, lyricsContainerClone);
	};

	const injectNPVLyrics = injectLyrics(
		"aside .hzUuLPdH48AzgQun5NYQ",
		"aside .hzUuLPdH48AzgQun5NYQ",
	);
	const injectCinemaLyrics = injectLyrics(
		"#lyrics-cinema .esRByMgBY3TiENAsbDHA",
		"#lyrics-cinema .os-viewport-native-scrollbars-invisible",
	);

	injectNPVLyrics();
	injectCinemaLyrics();

	new PermanentMutationObserver(mod, ".Root__right-sidebar", injectNPVLyrics);
	new PermanentMutationObserver(mod, ".Root__lyrics-cinema", injectCinemaLyrics);
}
