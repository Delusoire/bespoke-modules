import { render } from "https://esm.sh/lit";
import { PermanentMutationObserver } from "/modules/Delusoire/delulib/lib/util.js";
import { createEventBus } from "/modules/Delusoire/stdlib/index.js";
export let eventBus;
export default async function(mod) {
    eventBus = createEventBus(mod);
    const { Player } = await import("./src/utils/Player.js");
    const { LyricsWrapper } = await import("./src/components/components.js");
    const injectLyrics = (insertSelector, scrollSelector)=>()=>{
            const lyricsContainer = document.querySelector(insertSelector);
            if (!lyricsContainer || lyricsContainer.classList.contains("injected")) return;
            lyricsContainer.classList.add("injected");
            const lyricsContainerClone = lyricsContainer.cloneNode(false);
            lyricsContainer.replaceWith(lyricsContainerClone);
            const ourLyricsContainer = new LyricsWrapper(scrollSelector);
            Player.stateSubject.subscribe((state)=>ourLyricsContainer.updateState(state));
            Player.progressPercentSubject.subscribe((progress)=>ourLyricsContainer.updateProgress(progress));
            render(ourLyricsContainer, lyricsContainerClone);
        };
    const injectNPVLyrics = injectLyrics("aside .hzUuLPdH48AzgQun5NYQ", "aside .hzUuLPdH48AzgQun5NYQ");
    const injectCinemaLyrics = injectLyrics("#lyrics-cinema .esRByMgBY3TiENAsbDHA", "#lyrics-cinema .os-viewport-native-scrollbars-invisible");
    injectNPVLyrics();
    injectCinemaLyrics();
    new PermanentMutationObserver(mod, ".OTfMDdomT5S7B5dbYTT8", injectNPVLyrics);
    new PermanentMutationObserver(mod, ".Root__lyrics-cinema", injectCinemaLyrics);
}
