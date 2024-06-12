import Dexie, { type Table } from "https://esm.sh/dexie";
import type { Track } from "https://esm.sh/v135/@fostertheweb/spotify-web-api-ts-sdk/dist/mjs/types.js";
import { chunkify50 } from "/modules/Delusoire/delulib/lib/fp.ts";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.ts";
import { _ } from "/modules/official/stdlib/deps.ts";
import { fromString, Types } from "/modules/official/stdlib/src/webpack/URI.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";

export const db = new (class extends Dexie {
	tracks!: Table<Track, string>;
	playlists!: Table<any, string>;

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

Image.prototype.toDataURL = function (maxSize: number) {
	const imgUrl = Promise.withResolvers<string>();

	this.onload = () => {
		const r = this.width / this.height;

		const e = Math.floor(Math.sqrt(Math.exp(1 - r)));

		const w = maxSize * (r - (r - 1) * (1 - e));
		const h = maxSize / (r - (r - 1) * e);

		const canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;

		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(this, 0, 0, w, h);

		const dataUrl = canvas.toDataURL("image/jpeg");
		canvas.remove();

		imgUrl.resolve(dataUrl);
	};

	return imgUrl.promise;
};

const extractUrl = (str: string) => {
	if (!str.startsWith("spotify:")) {
		return str;
	}
	const uri = fromString(str);
	switch (uri.type) {
		case Types.MOSAIC:
			return `https://mosaic.scdn.co/300/${uri.ids.join("")}`;
		case Types.IMAGE:
			return `https://i.scdn.co/image/${uri.id}`;
	}
	return str;
};

const labelSizes = {
	small: 0,
	standard: 1,
	large: 2,
	xlarge: 3,
} as const;

const getPlaylist = async (uri: string) => {
	const playlist = await PlaylistAPI.getPlaylist(uri);

	const images: Array<{ url: string; label: keyof typeof labelSizes }> = playlist.metadata.images ?? [];
	const image = images.sort((image) => labelSizes[image.label])[0];

	if (image) {
		const url = extractUrl(image.url);

		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = url;
		playlist.imgDataUrl = await img.toDataURL(32);
	} else {
		playlist.imgDataUrl = null;
	}

	return playlist;
};

export const getPlaylistsFromURIs = fetchOrPopulateDB(
	db.playlists,
	(uris) => Promise.all(uris.map((uri) => getPlaylist(uri))),
);
