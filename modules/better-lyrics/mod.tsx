import { createEventBus, type EventBus } from "/modules/stdlib/mod.ts";
import { Module } from "/hooks/index.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { createSettings, Settings } from "/modules/stdlib/lib/settings.tsx";

export let eventBus: EventBus;
export let settings: Settings;
export default async function (mod: Module) {
	eventBus = createEventBus(mod);
	[settings] = createSettings(mod);

	import("./settings.ts");
	const { BackgroundRenderer, LyricRenderer } = await import("./betterLyrics.tsx");

	globalThis.__renderCinemaLyrics = () => {
		const PlayerAPI = Platform.getPlayerAPI();

		const [data, setData] = React.useState(PlayerAPI.getState());

		React.useEffect(() => {
			const songListener = (e: any) => {
				setData(e.data);
			};

			PlayerAPI.getEvents().addListener("update", songListener);

			return () => {
				PlayerAPI.getEvents().removeListener("update", songListener);
			};
		}, []);

		return (
			<>
				<BackgroundRenderer data={data} />
				<LyricRenderer data={data} />
			</>
		);
	};
}
