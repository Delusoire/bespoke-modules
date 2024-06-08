import { LyricPlayer } from "./lyric-player.js";
import { BackgroundRender } from "./bg-render.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
const { useState, useRef, useCallback, useEffect } = React;
import { parseTTML } from "./ttml/parser.js";
export const App = ()=>{
    const audioRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState("");
    const [albumUrl, setAlbumUrl] = useState("");
    const [albumIsVideo, setAlbumIsVideo] = useState(false);
    const lyricPlayerRef = useRef(null);
    const [lyricLines, setLyricLines] = useState([]);
    const onClickOpenAudio = useCallback(()=>{
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "audio/*";
        input.onchange = ()=>{
            const file = input.files?.[0];
            if (file) {
                setAudioUrl((old)=>{
                    if (old.trim().length > 0) {
                        URL.revokeObjectURL(old);
                    }
                    return URL.createObjectURL(file);
                });
            }
        };
        input.click();
    }, []);
    const onClickOpenAlbumImage = useCallback(()=>{
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,video/*";
        input.onchange = ()=>{
            const file = input.files?.[0];
            if (file) {
                setAlbumIsVideo(file.type.startsWith("video/"));
                setAlbumUrl((old)=>{
                    if (old.trim().length > 0) {
                        URL.revokeObjectURL(old);
                    }
                    return URL.createObjectURL(file);
                });
            }
        };
        input.click();
    }, []);
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
        if (audioRef.current) {
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
        }
    }, [
        audioRef.current
    ]);
    useEffect(()=>{
        // 调试用途，暴露到 Window
        if (lyricPlayerRef.current) {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
        albumIsVideo: albumIsVideo
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
    }), /*#__PURE__*/ React.createElement("div", {
        style: {
            position: "absolute",
            right: "0",
            bottom: "0",
            backgroundColor: "#0004",
            margin: "1rem",
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
        }
    }, /*#__PURE__*/ React.createElement("div", null, "AMLL React 绑定调试页面"), /*#__PURE__*/ React.createElement("button", {
        type: "button",
        onClick: onClickOpenAudio
    }, "Load music"), /*#__PURE__*/ React.createElement("button", {
        type: "button",
        onClick: onClickOpenAlbumImage
    }, "Load Album Background Assets (Image/Video)"), /*#__PURE__*/ React.createElement("button", {
        type: "button",
        onClick: onClickOpenTTMLLyric
    }, "Load lyrics"), /*#__PURE__*/ React.createElement("audio", {
        controls: true,
        ref: audioRef,
        src: audioUrl,
        preload: "auto"
    })));
};
