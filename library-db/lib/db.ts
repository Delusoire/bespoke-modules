import Dexie, { type Table } from "https://esm.sh/dexie";
import type { Track } from "https://esm.sh/v135/@fostertheweb/spotify-web-api-ts-sdk/dist/mjs/types.js";
import { chunkify50 } from "/modules/Delusoire/delulib/lib/fp.ts";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.ts";
import { _ } from "/modules/official/stdlib/deps.ts";
import { fromString } from "/modules/official/stdlib/src/webpack/URI.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";

export const db = new (class extends Dexie {
	tracks!: Table<Track>;
	playlists!: Table;

	constructor() {
		super("library-db");
		this.version(1).stores({
			tracks: "&uri, external_ids.isrc",
			playlists: "&metadata.uri",
		});
	}
})();

// TODO: execute this in a worker
const fetchOrPopulateDB =
	<A, B>(table: Table<A, B>, fetcher: (primaryKeys: B[]) => Promise<A[]>) => async (primaryKeys: B[]) => {
		const objs = await table.bulkGet(primaryKeys);
		const missed = objs.reduce((missed, obj, i) => {
			obj ?? missed.push(i);
			return missed;
		}, [] as number[]);

		if (missed.length) {
			const fillers = await fetcher(missed.map((i) => primaryKeys[i]));
			table.bulkAdd(fillers);
			missed.forEach((i, j) => {
				objs[i] = fillers[j];
			});
		}

		return objs;
	};

export const getTracksFromURIs = fetchOrPopulateDB(db.tracks, (uris) => {
	const ids = uris.map((uri) => fromString(uri).id);
	return chunkify50((is) => spotifyApi.tracks.get(is))(ids);
});

const PlaylistAPI = Platform.getPlaylistAPI();

export const getPlaylistsFromURIs = fetchOrPopulateDB(
	db.playlists,
	(uris) => Promise.all(uris.map((uri) => PlaylistAPI.getPlaylist(uri))),
);
