import { createEventBus, type EventBus } from "/modules/official/stdlib/index.ts";
import { ModuleInstance } from "/hooks/module.ts";

import { React } from "/modules/official/stdlib/src/expose/React.ts";

import { LyricLine, LyricPlayer } from "./src/core/index.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { findLyrics } from "/modules/Delusoire/better-lyrics/src.old/utils/LyricsProvider.ts";
import { getSongPositionMs } from "/modules/Delusoire/delulib/lib/util.ts";

export let eventBus: EventBus;
export default async function (mod: ModuleInstance) {
	eventBus = createEventBus(mod);
}

globalThis.__renderCinemaLyrics = () => {
	const cinemaContainerRef = React.useRef<HTMLDivElement>(null);
	const playerRef = React.useRef<LyricPlayer>();

	const PlayerAPI = Platform.getPlayerAPI();

	const [data, setData] = React.useState(PlayerAPI.getState());

	const [rendering, setRendering] = React.useState(false);

	React.useEffect(() => {
		playerRef.current = new LyricPlayer();
		const songListener = (e: any) => {
			if (e.data.item.uri !== data.item.uri) {
				setData(data);
			}
		};

		PlayerAPI.getEvents().addListener("update", songListener);

		return () => {
			PlayerAPI.getEvents().removeListener("update", songListener);
			playerRef.current?.dispose();
		};
	}, []);

	React.useEffect(() => {
		if (!playerRef.current) {
			return;
		}

		const item = data?.item;
		if (!item || item.type !== "track") {
			playerRef.current.setLyricLines([]);
			return;
		}

		let cancelled = false;

		const { metadata } = item;

		findLyrics({
			uri: item.uri,
			album: metadata.album_title,
			artist: metadata.artist_name,
			durationS: metadata.duration / 1000,
			title: metadata.title,
		}).then((lyrics) => {
			if (cancelled) {
				return;
			}

			const syncedLyrics = lyrics.wordSynced ?? lyrics.lineSynced;
			if (!syncedLyrics) {
				return;
			}

			const l: LyricLine[] = syncedLyrics.content.map((line) => {
				return {
					words: line.content.map((word) => ({
						word: word.content,
						startTime: word.tsp * metadata.duration,
						endTime: word.tep * metadata.duration,
					})),
					translatedLyric: "",
					romanLyric: "",
					isBG: false,
					isDuet: false,
					startTime: line.tsp * metadata.duration,
					endTime: line.tep * metadata.duration,
				};
			});

			playerRef.current?.setLyricLines(l);
		});

		return () => {
			cancelled = true;
		};
	}, [playerRef.current, data]);

	React.useEffect(() => {
		if (playerRef.current) {
			cinemaContainerRef.current?.appendChild(playerRef.current.getElement());
			setRendering(true);
			return () => {
				setRendering(false);
			};
		}
	}, [cinemaContainerRef.current]);

	React.useEffect(() => {
		if (!rendering) {
			return;
		}
		let canceled = false;
		let lastTime: number;
		const onFrame = (time: number) => {
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
		return () => {
			canceled = true;
		};
	}, [rendering]);

	return (
		<div
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
			ref={cinemaContainerRef}
		/>
	);
};
