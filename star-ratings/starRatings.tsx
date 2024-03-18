import { updateCollectionControls, updateNowPlayingControls, updateTrackControls } from "./controls.js";
import { loadRatings } from "./util.js";
import { CONFIG } from "./settings.js";

import { _ } from "/modules/Delusoire/stdlib/deps.js";
import { onTrackListMutationListeners } from "/modules/Delusoire/delulib/lib/listeners.js";
import { SVGIcons } from "/modules/Delusoire/stdlib/index.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
import { useMenuItem } from "/modules/Delusoire/stdlib/src/registers/menu.js";
import { createIconComponent } from "/modules/Delusoire/stdlib/lib/createIconComponent.js";
import { eventBus } from "./index.js";
const { URI } = S;

declare global {
	var tracksRatings: Record<string, number>;
	var playlistUris: string[];
}

globalThis.tracksRatings || (globalThis.tracksRatings = {});
globalThis.playlistUris || (globalThis.playlistUris = []);

const PlayerAPI = S.Platform.getPlayerAPI();

loadRatings();

eventBus.Player.song_changed.subscribe(state => {
	if (!state) return;
	const { uri } = state.item ?? {};
	if (!uri) return;

	if (Number(CONFIG.skipThreshold)) {
		const currentTrackRating = tracksRatings[uri] ?? Number.MAX_SAFE_INTEGER;
		if (currentTrackRating <= Number(CONFIG.skipThreshold)) return void PlayerAPI.skipToNext();
	}

	updateNowPlayingControls(uri);
});

onTrackListMutationListeners.push(async (_, tracks) => {
	for (const track of tracks) updateTrackControls(track, track.props.uri);
});

eventBus.History.updated.subscribe(({ pathname }) => {
	try {
		const uri = URI.fromString(pathname);
		if (_.overSome([URI.is.Album, URI.is.Artist, URI.is.PlaylistV1OrV2])) {
			updateCollectionControls(uri);
		}
	} catch (_) {}
});

export const FolderPickerMenuItem = () => {
	const { props } = useMenuItem();
	const { uri } = props.reference;
	return (
		<S.ReactComponents.MenuItem
			disabled={false}
			onClick={() => {
				CONFIG.ratingsFolderUri = uri;
			}}
			leadingIcon={createIconComponent({
				icon: SVGIcons["playlist-folder"],
			})}
		>
			Choose for Ratings Playlists
		</S.ReactComponents.MenuItem>
	);
};
