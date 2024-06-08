import { LyricPlayer, type LyricPlayerRef } from "./lyric-player.tsx";
import { BackgroundRender } from "./bg-render.tsx";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
const { useState, useRef, useCallback, useEffect } = React;
import { parseTTML } from "./ttml/parser.ts";
import type { LyricLine } from "./core/index.ts";

export const App: React.FC = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [albumUrl, setAlbumUrl] = useState("");
	const lyricPlayerRef = useRef<LyricPlayerRef>(null);
	const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);

	const onClickOpenTTMLLyric = useCallback(() => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".ttml,text/*";
		input.onchange = async () => {
			const file = input.files?.[0];
			if (file) {
				const text = await file.text();
				setLyricLines(parseTTML(text).lyricLines);
			}
		};
		input.click();
	}, []);

	useEffect(() => {
		if (!audioRef.current) {
			return;
		}
		let lastTime = -1;
		const onFrame = (time: number) => {
			if (audioRef.current && !audioRef.current.paused) {
				if (lastTime === -1) {
					lastTime = time;
				}
				lyricPlayerRef.current?.lyricPlayer?.update(time - lastTime);
				lastTime = time;
				lyricPlayerRef.current?.lyricPlayer?.setCurrentTime(
					(audioRef.current.currentTime * 1000) | 0,
				);
				requestAnimationFrame(onFrame);
			}
		};
		const onPlay = () => onFrame(0);
		audioRef.current.addEventListener("play", onPlay);
		return () => {
			audioRef.current?.removeEventListener("play", onPlay);
		};
	}, [audioRef.current]);

	useEffect(() => {
		if (lyricPlayerRef.current) {
			(window as any).lyricPlayer = lyricPlayerRef.current;
		}
	}, [lyricPlayerRef.current]);

	return (
		<>
			<BackgroundRender
				style={{
					position: "absolute",
					top: "0",
					left: "0",
					width: "100%",
					height: "100%",
				}}
				album={albumUrl}
				albumIsVideo={false}
			/>
			<LyricPlayer
				style={{
					position: "absolute",
					top: "0",
					left: "0",
					width: "100%",
					height: "100%",
					maxWidth: "100%",
					maxHeight: "100%",
					contain: "paint layout",
					overflow: "hidden",
					mixBlendMode: "plus-lighter",
				}}
				ref={lyricPlayerRef}
				alignAnchor="center"
				lyricLines={lyricLines}
			/>
		</>
	);
};
