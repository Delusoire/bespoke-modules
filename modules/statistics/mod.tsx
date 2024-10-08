import { createEventBus, createLogger, createRegistrar, createStorage } from "/modules/stdlib/mod.ts";
import { createSettings } from "/modules/stdlib/lib/settings.tsx";

import { NavLink } from "/modules/stdlib/src/registers/navlink.tsx";
import { ACTIVE_ICON, ICON } from "./static.ts";

import PlaylistPage from "./pages/playlist.tsx";
import { display } from "/modules/stdlib/lib/modal.tsx";
import { TopbarLeftButton } from "/modules/stdlib/src/registers/topbarLeftButton.tsx";
import type { Settings } from "/modules/stdlib/lib/settings.tsx";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";
import { fromString, is } from "/modules/stdlib/src/webpack/URI.ts";
import { Route } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import type { ModuleInstance } from "/hooks/module.ts";

const History = Platform.getHistory();

export let storage: Storage;
export let logger: Console;
export let settings: Settings;
export let settingsButton: React.JSX.Element;

export default function (mod: ModuleInstance) {
	storage = createStorage(mod);
	logger = createLogger(mod);
	[settings, settingsButton] = createSettings(mod);
	const eventBus = createEventBus(mod);
	const registrar = createRegistrar(mod);

	let rerenderPlaylistEdit: React.DispatchWithoutAction | null = null;
	let isPlaylistEditHidden = true;

	const PlaylistEdit = () => {
		const [, rerender] = React.useReducer((n) => n + 1, 0);
		rerenderPlaylistEdit = rerender;

		if (isPlaylistEditHidden) return;

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
		isPlaylistEditHidden = !is.PlaylistV1OrV2(pathname);
		rerenderPlaylistEdit?.();
	});

	registrar.register("topbarLeftButton", <PlaylistEdit />);

	const LazyStatsApp = React.lazy(() => import("./app.tsx"));
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
