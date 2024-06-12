import { Tooltip } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.js";
import { Snackbar } from "/modules/official/stdlib/src/expose/Snackbar.js";
const RootlistAPI = Platform.getRootlistAPI();
const PlaylistAPI = Platform.getPlaylistAPI();
async function createPlaylist({ name, tracks }) {
    try {
        const playlistUri = await RootlistAPI.createPlaylist(name, {
            before: "start"
        });
        await PlaylistAPI.add(playlistUri, tracks, {
            before: "start"
        });
    } catch (error) {
        console.error(error);
        Snackbar.enqueueSnackbar("Failed to create playlist", {
            variant: "error"
        });
    }
}
const CreatePlaylistButton = (props)=>/*#__PURE__*/ React.createElement(Tooltip, {
        label: "Turn Into Playlist",
        renderInline: true,
        placement: "top"
    }, /*#__PURE__*/ React.createElement(UI.ButtonSecondary, {
        "aria-label": "Turn Into Playlist",
        children: "Turn Into Playlist",
        semanticColor: "textBase",
        buttonSize: "sm",
        onClick: ()=>createPlaylist(props),
        className: "stats-make-playlist-button"
    }));
export default CreatePlaylistButton;
