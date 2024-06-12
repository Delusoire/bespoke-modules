import { _ } from "/modules/official/stdlib/deps.ts";
import { progressify } from "/modules/Delusoire/delulib/lib/fp.ts";
import {
	createPlaylistFromTracks,
	fetchFolder,
	fetchPlaylistContents,
	fetchRootFolder,
	movePlaylistTracks,
	setPlaylistVisibility,
} from "/modules/Delusoire/delulib/lib/platform.ts";
import { SpotifyLoc } from "/modules/Delusoire/delulib/lib/util.ts";

import { lastFetchedUri, lastSortAction } from "./sortPlus.tsx";
import { CONFIG } from "./settings.ts";
import { ERROR, getNameFromUri } from "./util.ts";
import { Snackbar } from "/modules/official/stdlib/src/expose/Snackbar.ts";
import { fromString, is } from "/modules/official/stdlib/src/webpack/URI.ts";

export const createPlaylistFromLastSortedQueue = async () => {
	if (globalThis.lastSortedQueue.length === 0) {
		Snackbar.enqueueSnackbar(ERROR.LAST_SORTED_QUEUE_EMPTY, { variant: "error" });
		return;
	}

	const sortedPlaylistsFolder = await fetchFolder(CONFIG.sortedPlaylistsFolderUri).catch(fetchRootFolder);

	const uri = fromString(lastFetchedUri);
	const playlistName = `${await getNameFromUri(uri)} - ${lastSortAction}`;

	const { success, uri: playlistUri } = await createPlaylistFromTracks(
		playlistName,
		globalThis.lastSortedQueue.map(t => t.uri),
		sortedPlaylistsFolder.uri,
	);

	if (!success) {
		Snackbar.enqueueSnackbar(`Failed to create Playlist ${playlistName}`, { variant: "error" });
		return;
	}

	setPlaylistVisibility(playlistUri, false);
	Snackbar.enqueueSnackbar(`Playlist ${playlistName} created`, { variant: "default" });
};

export const reordedPlaylistLikeSortedQueue = async () => {
	if (globalThis.lastSortedQueue.length === 0) {
		Snackbar.enqueueSnackbar(ERROR.LAST_SORTED_QUEUE_EMPTY, { variant: "error" });
		return;
	}

	if (!is.PlaylistV1OrV2(lastFetchedUri)) {
		Snackbar.enqueueSnackbar(ERROR.LAST_SORTED_QUEUE_NOT_A_PLAYLIST, { variant: "error" });
		return;
	}

	const sortedUids = globalThis.lastSortedQueue.map(track => track.uid!);
	const playlistUids = (await fetchPlaylistContents(lastFetchedUri)).map(item => item.uid);

	let i = sortedUids.length - 1;
	const uidsByReqs = new Array<string[]>();
	while (i >= 0) {
		const uids = new Array<string>();

		_.forEachRight(playlistUids, (uid, j) => {
			if (uid === sortedUids[i]) {
				i--;
				playlistUids.splice(j, 1);
				uids.push(uid);
			}
		});

		uidsByReqs.push(uids.reverse());
	}

	const fn = progressify((uids: string[]) => movePlaylistTracks(lastFetchedUri, uids, SpotifyLoc.before.start()), uidsByReqs.length);

	await Promise.all(uidsByReqs.map(fn));

	Snackbar.enqueueSnackbar("Reordered the sorted playlist", { variant: "default" });
	if (playlistUids.length) {
		Snackbar.enqueueSnackbar(`Left ${playlistUids.length} unordered at the bottom`, { variant: "default" });
	}
};
