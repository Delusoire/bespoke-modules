import { S, SVGIcons, createStorage, createRegistrar, createLogger, createEventBus } from "/modules/Delusoire/stdlib/index.js";
import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";

import { NavLink } from "/modules/Delusoire/stdlib/src/registers/navlink.js";
import { ACTIVE_ICON, ICON } from "./static.js";
import type { Module } from "/hooks/module.js";

import PlaylistPage from "./pages/playlist.js";
import { display } from "/modules/Delusoire/stdlib/lib/modal.js";
import { Button } from "/modules/Delusoire/stdlib/src/registers/topbarLeftButton.js";
import type { Settings } from "/modules/Delusoire/stdlib/lib/settings.js";

const { React, URI } = S;

const History = S.Platform.getHistory();

export let storage: Storage = undefined;
export let logger: Console = undefined;
export let settings: Settings = undefined;
export let settingsButton: React.JSX.Element = undefined;

export default function (mod: Module) {
	storage = createStorage(mod);
	logger = createLogger(mod);
	[settings, settingsButton] = createSettings(mod);
	const eventBus = createEventBus(mod);
	const registrar = createRegistrar(mod);

	let setPlaylistEditHidden: React.Dispatch<React.SetStateAction<boolean>> | undefined = undefined;

	const PlaylistEdit = () => {
		const [hidden, setHidden] = React.useState(true);
		setPlaylistEditHidden = setHidden;
		if (hidden) return;

		return (
			<Button
				label="playlist-stats"
				icon={SVGIcons.visualizer}
				onClick={() => {
					const playlistUri = URI.fromString(History.location.pathname).toURI();
					display({ title: "Playlist Stats", content: <PlaylistPage uri={playlistUri} />, isLarge: true });
				}}
			/>
		);
	};

	eventBus.History.updated.subscribe(({ pathname }) => {
		const isPlaylistPage = URI.is.PlaylistV1OrV2(pathname);
		setPlaylistEditHidden?.(!isPlaylistPage);
	});

	registrar.register("topbarLeftButton", PlaylistEdit);

	const LazyStatsApp = S.React.lazy(() => import("./app.js"));
	registrar.register("route", <S.ReactComponents.Route path={"/bespoke/stats/*"} element={<LazyStatsApp />} />);

	registrar.register("navlink", () => <NavLink localizedApp="Statistics" appRoutePath="/bespoke/stats" icon={ICON} activeIcon={ACTIVE_ICON} />);
}
