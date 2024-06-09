import { LyricPlayer } from "./lyric-player.js";
import { BackgroundRender } from "./bg-render.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
const { useState, useRef, useCallback, useEffect } = React;
import { parseTTML } from "./ttml/parser.js";
export const App = ()=>{
    const audioRef = useRef(null);
    const [albumUrl, setAlbumUrl] = useState("");
    const lyricPlayerRef = useRef(null);
    const [lyricLines, setLyricLines] = useState([]);
    const onClickOpenTTMLLyric = useCallback(()=>{
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".ttml,text/*";
        input.onchange = async ()=>{
            const file = input.files?.[0];
            if (file) {
                const text = await file.text();
                setLyricLines(parseTTML(text).lyricLines);
            }
        };
        input.click();
    }, []);
    useEffect(()=>{
        if (!audioRef.current) {
            return;
        }
        let lastTime = -1;
        const onFrame = (time)=>{
            if (audioRef.current && !audioRef.current.paused) {
                if (lastTime === -1) {
                    lastTime = time;
                }
                lyricPlayerRef.current?.lyricPlayer?.update(time - lastTime);
                lastTime = time;
                lyricPlayerRef.current?.lyricPlayer?.setCurrentTime(audioRef.current.currentTime * 1000 | 0);
                requestAnimationFrame(onFrame);
            }
        };
        const onPlay = ()=>onFrame(0);
        audioRef.current.addEventListener("play", onPlay);
        return ()=>{
            audioRef.current?.removeEventListener("play", onPlay);
        };
    }, [
        audioRef.current
    ]);
    useEffect(()=>{
        if (lyricPlayerRef.current) {
            window.lyricPlayer = lyricPlayerRef.current;
        }
    }, [
        lyricPlayerRef.current
    ]);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(BackgroundRender, {
        style: {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%"
        },
        album: albumUrl,
        albumIsVideo: false
    }), /*#__PURE__*/ React.createElement(LyricPlayer, {
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
        ref: lyricPlayerRef,
        alignAnchor: "center",
        lyricLines: lyricLines
    }));
};
