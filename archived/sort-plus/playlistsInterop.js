import { _ } from "/modules/stdlib/deps.js";
import { progressify } from "/modules/Delusoire.delulib/lib/fp.js";
import { createPlaylistFromTracks, fetchFolder, fetchPlaylistContents, fetchRootFolder, movePlaylistTracks, setPlaylistVisibility } from "/modules/Delusoire.delulib/lib/platform.js";
import { SpotifyLoc } from "/modules/Delusoire.delulib/lib/util.js";
import { lastFetchedUri, lastSortAction } from "./sortPlus.js";
import { CONFIG } from "./settings.js";
import { ERROR, getNameFromUri } from "./util.js";
import { Snackbar } from "/modules/stdlib/src/expose/Snackbar.js";
import { fromString, is } from "/modules/stdlib/src/webpack/URI.js";
export const createPlaylistFromLastSortedQueue = async ()=>{
    if (globalThis.lastSortedQueue.length === 0) {
        Snackbar.enqueueSnackbar(ERROR.LAST_SORTED_QUEUE_EMPTY, {
            variant: "error"
        });
        return;
    }
    const sortedPlaylistsFolder = await fetchFolder(CONFIG.sortedPlaylistsFolderUri).catch(fetchRootFolder);
    const uri = fromString(lastFetchedUri);
    const playlistName = `${await getNameFromUri(uri)} - ${lastSortAction}`;
    const { success, uri: playlistUri } = await createPlaylistFromTracks(playlistName, globalThis.lastSortedQueue.map((t)=>t.uri), sortedPlaylistsFolder.uri);
    if (!success) {
        Snackbar.enqueueSnackbar(`Failed to create Playlist ${playlistName}`, {
            variant: "error"
        });
        return;
    }
    setPlaylistVisibility(playlistUri, false);
    Snackbar.enqueueSnackbar(`Playlist ${playlistName} created`, {
        variant: "default"
    });
};
export const reordedPlaylistLikeSortedQueue = async ()=>{
    if (globalThis.lastSortedQueue.length === 0) {
        Snackbar.enqueueSnackbar(ERROR.LAST_SORTED_QUEUE_EMPTY, {
            variant: "error"
        });
        return;
    }
    if (!is.PlaylistV1OrV2(lastFetchedUri)) {
        Snackbar.enqueueSnackbar(ERROR.LAST_SORTED_QUEUE_NOT_A_PLAYLIST, {
            variant: "error"
        });
        return;
    }
    const sortedUids = globalThis.lastSortedQueue.map((track)=>track.uid);
    const playlistUids = (await fetchPlaylistContents(lastFetchedUri)).map((item)=>item.uid);
    let i = sortedUids.length - 1;
    const uidsByReqs = new Array();
    while(i >= 0){
        const uids = new Array();
        _.forEachRight(playlistUids, (uid, j)=>{
            if (uid === sortedUids[i]) {
                i--;
                playlistUids.splice(j, 1);
                uids.push(uid);
            }
        });
        uidsByReqs.push(uids.reverse());
    }
    const fn = progressify((uids)=>movePlaylistTracks(lastFetchedUri, uids, SpotifyLoc.before.start()), uidsByReqs.length);
    await Promise.all(uidsByReqs.map(fn));
    Snackbar.enqueueSnackbar("Reordered the sorted playlist", {
        variant: "default"
    });
    if (playlistUids.length) {
        Snackbar.enqueueSnackbar(`Left ${playlistUids.length} unordered at the bottom`, {
            variant: "default"
        });
    }
};
