import { createEventBus, createLogger, createRegistrar, createStorage } from "/modules/official/stdlib/index.js";
import { createSettings } from "/modules/official/stdlib/lib/settings.js";
import { NavLink } from "/modules/official/stdlib/src/registers/navlink.js";
import { ACTIVE_ICON, ICON } from "./static.js";
import PlaylistPage from "./pages/playlist.js";
import { display } from "/modules/official/stdlib/lib/modal.js";
import { TopbarLeftButton } from "/modules/official/stdlib/src/registers/topbarLeftButton.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { fromString, is } from "/modules/official/stdlib/src/webpack/URI.js";
import { Route } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
const History = Platform.getHistory();
export let storage;
export let logger;
export let settings;
export let settingsButton;
export default function(mod) {
    storage = createStorage(mod);
    logger = createLogger(mod);
    [settings, settingsButton] = createSettings(mod);
    const eventBus = createEventBus(mod);
    const registrar = createRegistrar(mod);
    let setPlaylistEditHidden = undefined;
    const PlaylistEdit = ()=>{
        const [hidden, setHidden] = React.useState(true);
        setPlaylistEditHidden = setHidden;
        if (hidden) return;
        return /*#__PURE__*/ React.createElement(TopbarLeftButton, {
            label: "playlist-stats",
            icon: '<path d="M.999 15h2V5h-2v10zm4 0h2V1h-2v14zM9 15h2v-4H9v4zm4-7v7h2V8h-2z"/>',
            onClick: ()=>{
                const playlistUri = fromString(History.location.pathname).toURI();
                display({
                    title: "Playlist Stats",
                    content: /*#__PURE__*/ React.createElement(PlaylistPage, {
                        uri: playlistUri
                    }),
                    isLarge: true
                });
            }
        });
    };
    eventBus.History.updated.subscribe(({ pathname })=>{
        const isPlaylistPage = is.PlaylistV1OrV2(pathname);
        setPlaylistEditHidden?.(!isPlaylistPage);
    });
    registrar.register("topbarLeftButton", /*#__PURE__*/ React.createElement(PlaylistEdit, null));
    const LazyStatsApp = React.lazy(()=>import("./app.js"));
    registrar.register("route", /*#__PURE__*/ React.createElement(Route, {
        path: "/bespoke/stats/*",
        element: /*#__PURE__*/ React.createElement(LazyStatsApp, null)
    }));
    registrar.register("navlink", /*#__PURE__*/ React.createElement(NavLink, {
        localizedApp: "Statistics",
        appRoutePath: "/bespoke/stats",
        icon: ICON,
        activeIcon: ACTIVE_ICON
    }));
}
