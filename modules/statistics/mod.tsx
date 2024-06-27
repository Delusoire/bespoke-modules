import {
	createEventBus,
	createLogger,
	createRegistrar,
	createStorage,
} from "/modules/official/stdlib/mod.ts";
import { createSettings } from "/modules/official/stdlib/lib/settings.tsx";

import { NavLink } from "/modules/official/stdlib/src/registers/navlink.tsx";
import { ACTIVE_ICON, ICON } from "./static.ts";

import PlaylistPage from "./pages/playlist.tsx";
import { display } from "/modules/official/stdlib/lib/modal.tsx";
import { TopbarLeftButton } from "/modules/official/stdlib/src/registers/topbarLeftButton.tsx";
import type { Settings } from "/modules/official/stdlib/lib/settings.tsx";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";

import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { fromString, is } from "/modules/official/stdlib/src/webpack/URI.ts";
import { Route } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { Module } from "/hooks/index.ts";

const History = Platform.getHistory();

export let storage: Storage;
export let logger: Console;
export let settings: Settings;
export let settingsButton: React.JSX.Element;

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
			<TopbarLeftButton
				label="playlist-stats"
				icon='<path d="M.999 15h2V5h-2v10zm4 0h2V1h-2v14zM9 15h2v-4H9v4zm4-7v7h2V8h-2z"/>'
				onClick={() => {
					const playlistUri = fromString(History.location.pathname).toURI();
					display({ title: "Playlist Stats", content: <PlaylistPage uri={playlistUri} />, isLarge: true });
				}}
			/>
		);
	};

	eventBus.History.updated.subscribe(({ pathname }) => {
		const isPlaylistPage = is.PlaylistV1OrV2(pathname);
		setPlaylistEditHidden?.(!isPlaylistPage);
	});

	registrar.register("topbarLeftButton", <PlaylistEdit />);

	const LazyStatsApp = React.lazy(() => import("./app.js"));
	registrar.register("route", <Route path={"/bespoke/stats/*"} element={<LazyStatsApp />} />);

	registrar.register(
		"navlink",
		<NavLink
			localizedApp="Statistics"
			appRoutePath="/bespoke/stats"
			icon={ICON}
			activeIcon={ACTIVE_ICON}
		/>,
	);
}
