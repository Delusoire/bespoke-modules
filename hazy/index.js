import { S, createEventBus } from "/modules/Delusoire/stdlib/index.js";
const BACKGROUND_URL = "";
const PlayerAPI = S.Platform.getPlayerAPI();
const History = S.Platform.getHistory();
const style = document.documentElement.style;
const getPlayerAPIPref = (key)=>PlayerAPI._prefs.get({
        key
    }).then((res)=>res.entries[key]);
function fetchValues() {
    const parseIntFromStorage = (key)=>Number.parseInt(localStorage.getItem(key));
    const blurValue = parseIntFromStorage("blurAmount");
    const contValue = parseIntFromStorage("contAmount");
    const satuValue = parseIntFromStorage("satuAmount");
    const brightValue = parseIntFromStorage("brightAmount");
    const numOrDef = (num, def)=>Number.isNaN(num) ? def : num;
    style.setProperty("--blur", `${numOrDef(blurValue, 15)}px`);
    style.setProperty("--cont", `${numOrDef(contValue, 50)}%`);
    style.setProperty("--satu", `${numOrDef(satuValue, 70)}%`);
    style.setProperty("--bright", `${numOrDef(brightValue, 120)}%`);
}
fetchValues();
async function fetchFadeTime() {
    const crossfadeEnabledPref = await getPlayerAPIPref("audio.crossfade_v2");
    let fadeTimeMS = 400;
    if (crossfadeEnabledPref.bool) {
        const fadeTimeMSPref = getPlayerAPIPref("audio.crossfade.time_v2");
        fadeTimeMS = fadeTimeMSPref.number;
    }
    style.setProperty("--fade-time", `${fadeTimeMS / 1000}s`);
}
async function onSongChange() {
    fetchFadeTime();
    const { image_url } = PlayerAPI.getState().item?.metadata ?? {};
    style.setProperty("--image-url", `url("${image_url ?? BACKGROUND_URL}")`);
    updateLyricsPageProperties();
}
windowControls();
galaxyFade();
function scrollToTop() {
    const element = document.querySelector(".NXiYChVp4Oydfxd7rT5r");
    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
document.addEventListener("click", (event)=>{
    const clickedElement = event.target;
    if (clickedElement.closest(".G7zO58ORUHxcUw0sXktM")) {
        scrollToTop();
    }
});
function windowControls() {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1) {
        document.body.classList.add("windows");
    }
}
let loaded = true;
async function controlDimensions() {
    const zoomFactor = window.outerWidth / window.innerWidth;
    const { enableGlobalNavBar } = S.Platform.getLocalStorageAPI().getItem("remote-config-overrides");
    const isTouchscreenUi = enableGlobalNavBar === "home-next-to-navigation" || enableGlobalNavBar === "home-next-to-search";
    const app = document.querySelector(".ZQftYELq0aOsg6tPbVbV");
    let height, width;
    if (isTouchscreenUi) {
        const styleMap = app.firstElementChild.computedStyleMap();
        const panelGap = Number.parseInt(styleMap.get("--panel-gap")[0]);
        height = styleMap.get("height").value + 2 * panelGap;
        width = styleMap.get("padding-right").value;
    } else {
        height = app.computedStyleMap().get("padding-top").value;
        width = height * (zoomFactor > 1.25 ? 2.95 : 3.375);
    }
    style.setProperty("--control-height", `${height / zoomFactor}px`);
    style.setProperty("--control-width", `${width / zoomFactor}px`);
    loaded && requestAnimationFrame(controlDimensions);
}
controlDimensions();
function waitForElement(elements, func, timeout = 100) {
    const queries = elements.map((element)=>document.querySelector(element));
    if (queries.every((a)=>a)) {
        func(queries);
    } else if (timeout > 0) {
        setTimeout(waitForElement, 300, elements, func, timeout - 1);
    }
}
History.listen(updateLyricsPageProperties);
waitForElement([
    ".Root__lyrics-cinema"
], ([lyricsCinema])=>{
    const lyricsCinemaObserver = new MutationObserver(updateLyricsPageProperties);
    const lyricsCinemaObserverConfig = {
        attributes: true,
        attributeFilter: [
            "class"
        ]
    };
    lyricsCinemaObserver.observe(lyricsCinema, lyricsCinemaObserverConfig);
});
waitForElement([
    ".main-view-container"
], ([mainViewContainer])=>{
    const mainViewContainerResizeObserver = new ResizeObserver(updateLyricsPageProperties);
    mainViewContainerResizeObserver.observe(mainViewContainer);
});
// fixes container shifting & active line clipping | taken from: https://github.com/nimsandu/spicetify-bloom
function updateLyricsPageProperties() {
    function setLyricsPageProperties() {
        function detectTextDirection() {
            // 0, 1 - blank lines
            const lyric = document.querySelectorAll(".NiCdLCpp3o2z6nBrayOn")[2];
            const rtl_rx = /[\u0591-\u07FF]/;
            return rtl_rx.test(lyric.innerText) ? "rtl" : "ltr";
        }
        function setLyricsTransformOrigin(textDirection) {
            style.setProperty("--lyrics-text-direction", textDirection === "rtl" ? "right" : "left");
        }
        function calculateLyricsMaxWidth(lyricsContentWrapper) {
            const lyricsContentContainer = lyricsContentWrapper.parentElement;
            const marginLeft = parseInt(window.getComputedStyle(lyricsContentWrapper).marginLeft, 10);
            const totalOffset = lyricsContentWrapper.offsetLeft + marginLeft;
            return Math.round(0.95 * (lyricsContentContainer.clientWidth - totalOffset));
        }
        function lockLyricsWrapperWidth(lyricsWrapper) {
            const lyricsWrapperWidth = lyricsWrapper.getBoundingClientRect().width;
            lyricsWrapper.style.width = lyricsWrapper.style.maxWidth = `${lyricsWrapperWidth}px`;
        }
        waitForElement([
            ".esRByMgBY3TiENAsbDHA"
        ], ([lyricsContentWrapper])=>{
            lyricsContentWrapper.style.maxWidth = "";
            lyricsContentWrapper.style.width = "";
            const lyricsTextDirection = detectTextDirection();
            setLyricsTransformOrigin(lyricsTextDirection);
            const lyricsMaxWidth = calculateLyricsMaxWidth(lyricsContentWrapper);
            document.documentElement.style.setProperty("--lyrics-active-max-width", `${lyricsMaxWidth}px`);
            lockLyricsWrapperWidth(lyricsContentWrapper);
        });
    }
    function lyricsCallback(mutationsList, lyricsObserver) {
        for (const mutation of mutationsList)for (const addedNode of mutation.addedNodes ?? [])if (addedNode.classList?.contains("kGR_hu4tdj9PnUlSPaRL")) setLyricsPageProperties();
        lyricsObserver.disconnect;
    }
    waitForElement([
        ".kGR_hu4tdj9PnUlSPaRL"
    ], ([lyricsContentProvider])=>{
        const lyricsContentWrapper = lyricsContentProvider.parentElement;
        setLyricsPageProperties();
        const lyricsObserver = new MutationObserver(lyricsCallback);
        const lyricsObserverConfig = {
            childList: true
        };
        lyricsObserver.observe(lyricsContentWrapper, lyricsObserverConfig);
    });
}
function galaxyFade() {
    const applyFadeToScrollNode = (scrollNode)=>{
        const fadeDirection = scrollNode.scrollTop === 0 ? "bottom" : scrollNode.scrollHeight === scrollNode.scrollTop + scrollNode.clientHeight ? "top" : "full";
        scrollNode.setAttribute("fade", fadeDirection);
    };
    // Borrowed from the Galaxy theme | https://github.com/harbassan/spicetify-galaxy/
    // add fade and dimness effects to mainview and the the artist image on scroll
    waitForElement([
        ".jEMA2gVoLgPQqAFrPhFw .os-viewport.os-viewport-native-scrollbars-invisible"
    ], ([scrollNode])=>{
        scrollNode.addEventListener("scroll", ()=>{
            const scrollValue = scrollNode.scrollTop;
            const artist_fade = Math.max(0, -0.003 * scrollValue + 1);
            document.documentElement.style.setProperty("--artist-fade", artist_fade);
            applyFadeToScrollNode(scrollNode);
        });
    });
    waitForElement([
        ".BdcvqBAid96FaHAmPYw_ .os-viewport.os-viewport-native-scrollbars-invisible"
    ], ([scrollNode])=>{
        scrollNode.setAttribute("fade", "bottom");
        scrollNode.addEventListener("scroll", ()=>{
            applyFadeToScrollNode(scrollNode);
        });
    });
}
export default function(mod) {
    const eventBus = createEventBus(mod);
    eventBus.Player.song_changed.subscribe(onSongChange);
    return ()=>{
        loaded = false;
    };
}
