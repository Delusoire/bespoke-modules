import { render } from "https://esm.sh/lit";

import { PermanentMutationObserver } from "/modules/Delusoire/delulib/lib/util.js";

import { PlayerW } from "./src/utils/PlayerW.js";
import { LyricsWrapper } from "./src/components/components.js";
import type { Module } from "/hooks/module.js";

const injectLyrics = (insertSelector: string, scrollSelector: string) => () => {
	const lyricsContainer = document.querySelector<HTMLDivElement>(insertSelector);
	if (!lyricsContainer || lyricsContainer.classList.contains("injected")) return;
	lyricsContainer.classList.add("injected");
	const lyricsContainerClone = lyricsContainer.cloneNode(false) as typeof lyricsContainer;
	lyricsContainer.replaceWith(lyricsContainerClone);

	const ourLyricsContainer = new LyricsWrapper(scrollSelector);
	ourLyricsContainer.song = PlayerW.getSong() ?? null;
	PlayerW.songSubject.subscribe(song => ourLyricsContainer.updateSong(song ?? null));
	PlayerW.progressPercentSubject.subscribe(progress => ourLyricsContainer.updateProgress(progress));
	render(ourLyricsContainer, lyricsContainerClone);
};

const injectNPVLyrics = injectLyrics("aside .main-nowPlayingView-lyricsContent", "aside .main-nowPlayingView-lyricsContent");
const injectCinemaLyrics = injectLyrics("#lyrics-cinema .lyrics-lyrics-contentWrapper", "#lyrics-cinema .os-viewport-native-scrollbars-invisible");
injectNPVLyrics();
injectCinemaLyrics();

export default async function (mod: Module) {
	new PermanentMutationObserver(mod, ".Root__right-sidebar", injectNPVLyrics);
	new PermanentMutationObserver(mod, ".Root__lyrics-cinema", injectCinemaLyrics);
}
