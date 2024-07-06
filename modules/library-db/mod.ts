import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { getPlaylistsFromURIs, getTracksFromURIs } from "./lib/db.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";
import { is } from "/modules/stdlib/src/webpack/URI.ts";

const RootlistAPI = Platform.getRootlistAPI();
const PlaylistAPI = Platform.getPlaylistAPI();

const extractPlaylists = (leaf: any): Array<Record<string, any>> => {
	switch (leaf.type) {
		case "playlist": {
			return [leaf];
		}
		case "folder": {
			return leaf.items.flatMap(extractPlaylists).filter((leaf) => leaf.owner.uri !== "spotify:user:");
		}
	}
	return [];
};

const extractItemsUris = ({ items }: any) => items.map((item) => item.uri);
const getPlaylistTracks = (playlist) => PlaylistAPI.getContents(playlist).then(extractItemsUris);

export const mapAssocs = (uris: string[], fn: (assocs: Map<string, number>) => void) => {
	for (const uri of uris) {
		const assocs = PlaylistItems.get(uri) ?? new Map<string, number>();
		fn(assocs);
		PlaylistItems.set(uri, assocs);
	}
};

const onPlaylistsAdded = async (playlists: string[]) => {
	for (const playlist of playlists) {
		SavedPlaylists.add(playlist);
		onTracksAddedToPlaylist(playlist, await getPlaylistTracks(playlist));
	}
	await getPlaylistsFromURIs(playlists);
};

const onPlaylistsRemoved = async (playlists: string[]) => {
	for (const playlist of playlists) {
		SavedPlaylists.delete(playlist);
		onTracksRemovedFromPlaylist(playlist, await getPlaylistTracks(playlist));
	}
};

const triggerUpdate = (uris: string[]) => {
	for (const uri of uris) {
		for (const update of listeners.get(uri)?.keys() ?? []) {
			update();
		}
	}
};

const onTracksAddedToPlaylist = async (playlist: string, uris: string[]) => {
	// ! ugly hack to ignore local files & episodes; come up with better fix
	uris = uris.filter((uri) => is.Track(uri));
	mapAssocs(uris, (o) => o.set(playlist, (o.get(playlist) ?? 0) + 1));
	await getTracksFromURIs(uris);
	triggerUpdate(uris);
};

const onTracksRemovedFromPlaylist = (playlist: string, uris: string[]) => {
	mapAssocs(uris, (o) => o.set(playlist, (o.get(playlist) ?? 0) - 1));
	triggerUpdate(uris);
};

export const SavedPlaylists = new Set<string>();

RootlistAPI.getContents({ limit: 50000 })
	.then(extractPlaylists)
	.then((playlists) => onPlaylistsAdded(playlists.map((playlist) => playlist.uri)));
RootlistAPI.getEvents().addListener("operation_complete", async ({ data }) => {
	const playlists = data.items;
	switch (data.operation) {
		case "add": {
			return void onPlaylistsAdded(playlists);
		}
		case "remove": {
			return void onPlaylistsRemoved(playlists);
		}
	}
});

export const PlaylistItems = new Map<string, Map<string, number>>();

for (const playlist of SavedPlaylists) {
	const uris = await PlaylistAPI.getContents(playlist).then(extractItemsUris);
	onTracksAddedToPlaylist(playlist, uris);
}

PlaylistAPI.getEvents().addListener("operation_complete", ({ data }) => {
	switch (data.operation) {
		case "add": {
			onTracksAddedToPlaylist(data.uri, data.uris);
			return;
		}
		case "remove": {
			onTracksRemovedFromPlaylist(
				data.uri,
				data.items.map((item) => item.uri),
			);
			return;
		}
	}
});

const listeners = new Map<string, Set<() => void>>();

export const useLivePlaylistItems = (uri: string) => {
	const [, update] = React.useReducer((n) => n + 1, 0);

	React.useEffect(() => {
		let ls = listeners.get(uri);
		if (!ls) {
			ls = new Set();
			listeners.set(uri, ls);
		}
		ls.add(update);
		return () => {
			ls.delete(update);
		};
	}, []);

	return Array.from(PlaylistItems.get(uri)?.entries() ?? []).flatMap((
		[playlist, count],
	) => (count > 0 ? [playlist] : []));
};

export default async function () { }
