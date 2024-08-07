import { SpotifyLoc } from "./util.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";

const LibraryAPI = Platform.getLibraryAPI();
const PlaylistAPI = Platform.getPlaylistAPI();
const RootlistAPI = Platform.getRootlistAPI();
const PlaylistPermissionsAPI = Platform.getPlaylistPermissionsAPI();
const LocalFilesAPI = Platform.getLocalFilesAPI();

export const areInLibrary = (uris: string[]) => LibraryAPI.contains(...uris);

export const setInLibrary = (uris: string[], liked: boolean) =>
	LibraryAPI[liked ? "add" : "remove"]({ uris });

export const toggleInLibrary = async (uris: string[]) => {
	const liked = await areInLibrary(uris);

	const urisByLiked = Object.groupBy(
		uris,
		(_, index) => (liked[index] ? "liked" : "notLiked"),
	);

	const ps = [];
	urisByLiked.liked?.length && ps.push(setInLibrary(urisByLiked.liked, false));
	urisByLiked.notLiked?.length &&
		ps.push(setInLibrary(urisByLiked.notLiked, true));

	return Promise.all(ps);
};

export const fetchLikedTracks = async () =>
	(
		await LibraryAPI.getTracks({
			limit: Number.MAX_SAFE_INTEGER,
		})
	).items;
export const fetchArtistLikedTracks = async (
	uri: string,
	offset = 0,
	limit = 100,
) => (await LibraryAPI.getTracks({ uri, offset, limit })).items;

export const fetchPlaylistContents = async (uri: string) =>
	(await PlaylistAPI.getContents(uri)).items;

export const createFolder = async (
	name: string,
	location: Platform.RootlistAPI.Location = {},
) => await RootlistAPI.createFolder(name, location);

export const addPlaylist = async (playlist: string, folder?: string) =>
	await RootlistAPI.add(
		[playlist],
		folder ? SpotifyLoc.after.fromUri(folder) : {},
	);

/* Replaced by createPlaylistFromTracks */
export const createPlaylist = async (
	name: string,
	location: Platform.RootlistAPI.Location = {},
) => await RootlistAPI.createPlaylist(name, location);

export const createPlaylistFromTracks = (
	name: string,
	tracks: string[],
	folder?: string,
) =>
	Platform.getCosmos().post(
		"sp://core-playlist/v1/rootlist?responseFormat=protobufJson",
		{
			operation: "create",
			...(folder ? { after: folder } : {}),
			name,
			playlist: true,
			uris: tracks,
		},
	);

export const setPlaylistVisibility = async (
	playlist: string,
	visibleForAll: boolean,
) =>
	await PlaylistPermissionsAPI.setBasePermission(
		playlist,
		visibleForAll ? "VIEWER" : "BLOCKED",
	);
export const setPlaylistPublished = async (
	playlist: string,
	published: boolean,
) => await RootlistAPI.setPublishedState(playlist, published);

export const fetchFolder = async (folder?: string) =>
	await RootlistAPI.getContents({ folderUri: folder });
export const fetchRootFolder = () => fetchFolder(undefined);

export const addPlaylistTracks = async (
	playlist: string,
	tracks: string[],
	location: Platform.RootlistAPI.Location = {},
) => await PlaylistAPI.add(playlist, tracks, location);

export const movePlaylistTracks = async (
	playlist: string,
	uids: string[],
	location: Platform.RootlistAPI.Location = {},
) =>
	await PlaylistAPI.move(
		playlist,
		uids.map((uid) => ({ uid })),
		location,
	);

export const removePlaylistTracks = (
	playlist: string,
	tracks: Array<{ uid: string }>,
) => PlaylistAPI.remove(playlist, tracks);

export const fetchLocalTracks = async () => await LocalFilesAPI.getTracks();
