import { LyricPlayer as CoreLyricPlayer } from "./core/index.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { ReactDOM } from "/modules/official/stdlib/src/webpack/React.js";
const { useRef, useEffect, forwardRef, useImperativeHandle } = React;
/**
 * 歌词播放组件，本框架的核心组件
 *
 * 尽可能贴切 Apple Music for iPad 的歌词效果设计，且做了力所能及的优化措施
 */ export const LyricPlayer = forwardRef(({ disabled, playing, alignAnchor, alignPosition, enableSpring, enableBlur, enableScale, hidePassedLines, lyricLines, currentTime, isSeeking, enableLyricAdvanceDynamicLyricTime, wordFadeWidth, linePosXSpringParams, linePosYSpringParams, lineScaleSpringParams, bottomLine, onLyricLineClick, onLyricLineContextMenu, ...props }, ref)=>{
    const corePlayerRef = useRef();
    const wrapperRef = useRef(null);
    const currentTimeRef = useRef(currentTime);
    useEffect(()=>{
        corePlayerRef.current = new CoreLyricPlayer();
        return ()=>{
            corePlayerRef.current?.dispose();
        };
    }, []);
    useEffect(()=>{
        if (!disabled) {
            let canceled = false;
            let lastTime = -1;
            const onFrame = (time)=>{
                if (canceled) return;
                if (lastTime === -1) {
                    lastTime = time;
                }
                corePlayerRef.current?.update(time - lastTime);
                lastTime = time;
                requestAnimationFrame(onFrame);
            };
            requestAnimationFrame(onFrame);
            return ()=>{
                canceled = true;
            };
        }
    }, [
        disabled
    ]);
    useEffect(()=>{
        if (playing !== undefined) {
            if (playing) {
                corePlayerRef.current?.resume();
            } else {
                corePlayerRef.current?.pause();
            }
        } else corePlayerRef.current?.resume();
    }, [
        playing
    ]);
    useEffect(()=>{
        if (corePlayerRef.current) {
            wrapperRef.current?.appendChild(corePlayerRef.current.getElement());
        }
    }, [
        wrapperRef.current
    ]);
    useEffect(()=>{
        if (alignAnchor !== undefined) {
            corePlayerRef.current?.setAlignAnchor(alignAnchor);
        }
    }, [
        alignAnchor
    ]);
    useEffect(()=>{
        if (hidePassedLines !== undefined) {
            corePlayerRef.current?.setHidePassedLines(hidePassedLines);
        }
    }, [
        hidePassedLines
    ]);
    useEffect(()=>{
        if (alignPosition !== undefined) {
            corePlayerRef.current?.setAlignPosition(alignPosition);
        }
    }, [
        alignPosition
    ]);
    useEffect(()=>{
        if (enableSpring !== undefined) {
            corePlayerRef.current?.setEnableSpring(enableSpring);
        } else corePlayerRef.current?.setEnableSpring(true);
    }, [
        enableSpring
    ]);
    useEffect(()=>{
        if (enableScale !== undefined) {
            corePlayerRef.current?.setEnableScale(enableScale);
        } else corePlayerRef.current?.setEnableScale(true);
    }, [
        enableScale
    ]);
    useEffect(()=>{
        corePlayerRef.current?.setEnableBlur(enableBlur ?? true);
    }, [
        enableBlur
    ]);
    useEffect(()=>{
        if (currentTime !== undefined) {
            corePlayerRef.current?.setCurrentTime(currentTime);
            currentTimeRef.current = currentTime;
        } else corePlayerRef.current?.setCurrentTime(0);
    }, [
        currentTime
    ]);
    useEffect(()=>{
        corePlayerRef.current?.setLyricAdvanceDynamicLyricTime(enableLyricAdvanceDynamicLyricTime ?? true);
    }, [
        enableLyricAdvanceDynamicLyricTime
    ]);
    useEffect(()=>{
        if (lyricLines !== undefined) {
            corePlayerRef.current?.setLyricLines(lyricLines, currentTimeRef.current);
            corePlayerRef.current?.update();
        } else {
            corePlayerRef.current?.setLyricLines([]);
            corePlayerRef.current?.update();
        }
    }, [
        lyricLines
    ]);
    useEffect(()=>{
        corePlayerRef.current?.setIsSeeking(!!isSeeking);
    }, [
        isSeeking
    ]);
    useEffect(()=>{
        corePlayerRef.current?.setWordFadeWidth(wordFadeWidth);
    }, [
        wordFadeWidth
    ]);
    useEffect(()=>{
        if (linePosXSpringParams !== undefined) {
            corePlayerRef.current?.setLinePosXSpringParams(linePosXSpringParams);
        }
    }, [
        linePosXSpringParams
    ]);
    useEffect(()=>{
        if (linePosYSpringParams !== undefined) {
            corePlayerRef.current?.setLinePosYSpringParams(linePosYSpringParams);
        }
    }, [
        linePosYSpringParams
    ]);
    useEffect(()=>{
        if (lineScaleSpringParams !== undefined) {
            corePlayerRef.current?.setLineScaleSpringParams(lineScaleSpringParams);
        }
    }, [
        lineScaleSpringParams
    ]);
    useEffect(()=>{
        if (onLyricLineClick) {
            const handler = (e)=>onLyricLineClick(e);
            corePlayerRef.current?.addEventListener("line-click", handler);
            return ()=>corePlayerRef.current?.removeEventListener("line-click", handler);
        }
    }, [
        onLyricLineClick
    ]);
    useEffect(()=>{
        if (onLyricLineContextMenu) {
            const handler = (e)=>onLyricLineContextMenu(e);
            corePlayerRef.current?.addEventListener("line-contextmenu", handler);
            return ()=>corePlayerRef.current?.removeEventListener("line-contextmenu", handler);
        }
    }, [
        onLyricLineContextMenu
    ]);
    useImperativeHandle(ref, ()=>({
            wrapperEl: wrapperRef.current,
            lyricPlayer: corePlayerRef.current
        }), [
        wrapperRef.current,
        corePlayerRef.current
    ]);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
        ...props,
        ref: wrapperRef
    }), corePlayerRef.current?.getBottomLineElement() && bottomLine ? ReactDOM.createPortal(bottomLine, corePlayerRef.current?.getBottomLineElement()) : null);
});
