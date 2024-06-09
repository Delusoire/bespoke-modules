import { createEventBus } from "/modules/official/stdlib/index.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { BackgroundRender, EplorRenderer, LyricPlayer } from "./amll/index.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { findLyrics } from "./src/utils/LyricsProvider.js";
import { getSongPositionMs } from "/modules/Delusoire/delulib/lib/util.js";
export let eventBus;
export default async function(mod) {
    eventBus = createEventBus(mod);
}
const BackgroundRenderer_ = React.memo(({ data })=>{
    const backgroundWrapperRef = React.useRef(null);
    const rendererRef = React.useRef();
    const image = data.item.metadata.image_xlarge_url ?? data.item.metadata.image_large_url ?? data.item.metadata.image_url ?? data.item.metadata.image_small_url;
    React.useEffect(()=>{
        rendererRef.current = BackgroundRender.new(EplorRenderer);
        rendererRef.current.setFlowSpeed(10);
        return ()=>{
            rendererRef.current.dispose();
        };
    }, []);
    React.useEffect(()=>{
        if (!rendererRef.current || !image) {
            return;
        }
        rendererRef.current.setAlbum(image.replace(/^spotify:image:(.*)$/, "https://i.scdn.co/image/$1"), false);
    }, [
        rendererRef.current,
        image
    ]);
    React.useEffect(()=>{
        if (rendererRef.current) {
            const el = rendererRef.current.getElement();
            el.style.width = "100%";
            el.style.height = "100%";
            backgroundWrapperRef.current?.appendChild(el);
        }
    }, [
        backgroundWrapperRef.current
    ]);
    return /*#__PURE__*/ React.createElement("div", {
        style: {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%"
        },
        ref: backgroundWrapperRef
    });
});
const LyricRenderer_ = React.memo(({ data })=>{
    const lyricsWrapperRef = React.useRef(null);
    const playerRef = React.useRef();
    const [rendering, setRendering] = React.useState(false);
    React.useEffect(()=>{
        playerRef.current = new LyricPlayer();
        const clickListener = (e)=>{
            Platform.getPlayerAPI().seekTo(e.line.lyricLine.startTime);
        };
        playerRef.current.addEventListener("line-click", clickListener);
        return ()=>{
            playerRef.current.removeEventListener("line-click", clickListener);
            playerRef.current.dispose();
        };
    }, []);
    React.useEffect(()=>{
        if (!playerRef.current) {
            return;
        }
        playerRef.current.setLyricLines([]);
        const item = data?.item;
        if (!item || item.type !== "track") {
            return;
        }
        let cancelled = false;
        const { metadata } = item;
        findLyrics({
            uri: item.uri,
            album: metadata.album_title,
            artist: metadata.artist_name,
            durationS: metadata.duration / 1000,
            title: metadata.title
        }).then((lyrics)=>{
            if (cancelled) {
                return;
            }
            const syncedLyrics = lyrics.wordSynced ?? lyrics.lineSynced;
            if (!syncedLyrics) {
                return;
            }
            const l = syncedLyrics.content.map((line)=>{
                return {
                    words: line.content.map((word)=>({
                            word: word.content,
                            startTime: word.tsp * metadata.duration,
                            endTime: word.tep * metadata.duration
                        })),
                    translatedLyric: "",
                    romanLyric: "",
                    isBG: false,
                    isDuet: false,
                    startTime: line.tsp * metadata.duration,
                    endTime: line.tep * metadata.duration
                };
            });
            // if playerRef was changed cancelled would have been true
            playerRef.current.setLyricLines(l);
            playerRef.current.setLyricAdvanceDynamicLyricTime(true);
        });
        return ()=>{
            cancelled = true;
        };
    }, [
        playerRef.current,
        data.item.uri
    ]);
    React.useEffect(()=>{
        if (playerRef.current) {
            lyricsWrapperRef.current?.appendChild(playerRef.current.getElement());
            setRendering(true);
            return ()=>{
                setRendering(false);
            };
        }
    }, [
        lyricsWrapperRef.current
    ]);
    React.useEffect(()=>{
        if (!rendering) {
            return;
        }
        let canceled = false;
        let lastTime;
        const onFrame = (time)=>{
            if (data.isPaused) {
                canceled = true;
            }
            if (canceled) return;
            lastTime ??= time;
            playerRef.current?.update(time - lastTime);
            lastTime = time;
            playerRef.current?.setCurrentTime(getSongPositionMs(data));
            requestAnimationFrame(onFrame);
        };
        requestAnimationFrame(onFrame);
        return ()=>{
            canceled = true;
        };
    }, [
        rendering,
        data
    ]);
    React.useEffect(()=>{
        if (!playerRef.current) {
            return;
        }
        if (data.isPaused) {
            playerRef.current.pause();
        } else {
            playerRef.current.resume();
        }
    }, [
        playerRef.current,
        data.isPaused
    ]);
    return /*#__PURE__*/ React.createElement("div", {
        style: {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            contain: "paint layout",
            overflow: "hidden",
            mixBlendMode: "plus-lighter"
        },
        ref: lyricsWrapperRef
    });
});
globalThis.__renderCinemaLyrics = ()=>{
    const PlayerAPI = Platform.getPlayerAPI();
    const [data, setData] = React.useState(PlayerAPI.getState());
    React.useEffect(()=>{
        const songListener = (e)=>{
            setData(e.data);
        };
        PlayerAPI.getEvents().addListener("update", songListener);
        return ()=>{
            PlayerAPI.getEvents().removeListener("update", songListener);
        };
    }, []);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(BackgroundRenderer_, {
        data: data
    }), /*#__PURE__*/ React.createElement(LyricRenderer_, {
        data: data
    }));
};
