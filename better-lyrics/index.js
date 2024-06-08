import { createEventBus } from "/modules/official/stdlib/index.js";
export let eventBus;
export default async function(mod) {
    eventBus = createEventBus(mod);
// const { Player } = await import("./src.old/utils/Player.ts");
// const { LyricsWrapper } = await import("./src.old/components/components.ts");
// const injectLyrics = (insertSelector: string, scrollSelector: string) => () => {
// 	const lyricsContainer = document.querySelector<HTMLElement>(insertSelector);
// 	if (!lyricsContainer || lyricsContainer.classList.contains("injected")) return;
// 	lyricsContainer.classList.add("injected");
// 	const lyricsContainerClone = lyricsContainer.cloneNode(false) as typeof lyricsContainer;
// 	lyricsContainer.replaceWith(lyricsContainerClone);
// 	const ourLyricsContainer = new LyricsWrapper(scrollSelector);
// 	Player.stateSubject.subscribe((state) => ourLyricsContainer.updateState(state));
// 	Player.progressPercentSubject.subscribe((progress) => ourLyricsContainer.updateProgress(progress));
// 	render(ourLyricsContainer, lyricsContainerClone);
// };
// const injectNPVLyrics = injectLyrics(
// 	"aside .hzUuLPdH48AzgQun5NYQ",
// 	"aside .hzUuLPdH48AzgQun5NYQ",
// );
// const injectCinemaLyrics = injectLyrics(
// 	"#lyrics-cinema .esRByMgBY3TiENAsbDHA",
// 	"#lyrics-cinema .os-viewport-native-scrollbars-invisible",
// );
// injectNPVLyrics();
// injectCinemaLyrics();
// new PermanentMutationObserver(mod, ".Root__right-sidebar", injectNPVLyrics);
// new PermanentMutationObserver(mod, ".Root__lyrics-cinema", injectCinemaLyrics);
}
