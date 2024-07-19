import { CUSTOM_COLUMNS } from "/modules/Delusoire.tracklist-columns/mix.ts";
import {
	CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP,
	CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP,
	CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP,
	CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP,
	SortOrder,
} from "/modules/Delusoire.tracklist-columns/mix.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.xpui.js";
import { db } from "/modules/Delusoire.library-db/lib/db.ts";
import { useLiveQuery } from "/modules/Delusoire.dexie-react-hooks/mod.ts";
import { Module } from "/hooks/index.ts";
import { is } from "/modules/stdlib/src/webpack/URI.ts";
import { getAlbumsFromURIs } from "/modules/Delusoire.library-db/lib/db.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";

const Playcount = React.memo(
	({ uri, albumUri }: { uri: string; albumUri: string }) => {
		const album = useLiveQuery(async () => {
			const t = await db.albums.get(albumUri);
			return t;
		}, [albumUri]);

		const albumTracks = album?.tracks.items.map((w) => w.track);
		const playcount =
			albumTracks?.find((track) => track.uri === uri)?.playcount ?? -1;

		return (
			<UI.Text as="div" variant="bodySmall" className="HxDMwNr5oCxTOyqt85gi">
				{Number(playcount).toLocaleString()}
			</UI.Text>
		);
	},
);

const PlaycountWrapper = React.memo(({ data }: any) => {
	const uri = data.uri;
	const albumUri = data.album.uri;
	return uri && albumUri && <Playcount uri={uri} albumUri={albumUri} />;
});

const COLUMN = {
	type: "PLAYCOUNT",
	label: "Playcount",
	render: PlaycountWrapper,
	cond: () => true,
};

CUSTOM_COLUMNS[COLUMN.type] = COLUMN;

const SORT = {
	key: "playcount",
	label: "Playcount",
};

const SORT_FIELD = "PLAYCOUNT";

CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[COLUMN.type] = {
	key: SORT.key,
	value: SORT.label,
};

CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[SORT.key] = COLUMN.type;

CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[SORT.key] = {
	column: COLUMN.type,
	order: SortOrder.DESC,
};

CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[COLUMN.type] = SORT_FIELD;

const PlaylistAPI = Platform.getPlaylistAPI();

async function sortPlaylistContents(contents: any, opts: any) {
	const items = contents.items.filter((track) =>
		is.Track(track.uri) && !is.LocalTrack(track.uri)
	);
	const albumUris = items.map((track) => track.album.uri);
	const albums = await getAlbumsFromURIs(albumUris);

	if (opts?.sort?.field === SORT_FIELD) {
		const albumTracks = albums.flatMap((album) =>
			album.tracks.items.map((w) => w.track)
		);
		const urisToPlaycount = Object.fromEntries(
			albumTracks.map((
				track,
			) => [track.uri, Number(track.playcount ?? -1)]),
		);

		const sortedItems = items.toSorted((a, b) =>
			urisToPlaycount[a.uri] - urisToPlaycount[b.uri]
		);
		if (opts.sort.order === "DESC") {
			sortedItems.reverse();
		}

		contents.items = sortedItems;
		contents.limit = sortedItems.length;
		contents.totalLength = sortedItems.length;
	}

	const offset = opts?.offset ?? 0;
	const limit = opts?.limit ??
		(opts?.offset == null ? 0 : contents.items.length);

	contents.items = contents.items.slice(offset, offset + limit);
	contents.limit = contents.items.length;
}

const getPlaylist = PlaylistAPI.getPlaylist;
PlaylistAPI.getPlaylist = async function (uri: string, _, opts) {
	const _opts = {
		...opts,
		offset: 0,
		limit: 1e9,
	};
	if (_opts?.sort?.field === SORT_FIELD) {
		_opts.sort = undefined;
	}
	const playlist = await getPlaylist.call(PlaylistAPI, uri, _, _opts);

	await sortPlaylistContents(playlist.contents, opts);

	return playlist;
};

const getContents = PlaylistAPI.getContents;
PlaylistAPI.getContents = async function (uri: string, opts) {
	const _opts = {
		...opts,
		offset: 0,
		limit: 1e9,
	};
	if (_opts?.sort?.field === SORT_FIELD) {
		_opts.sort = undefined;
	}
	const contents = await getContents.call(PlaylistAPI, uri, _opts);

	await sortPlaylistContents(contents, opts);

	return contents;
};

export default async function (mod: Module) {
	return () => {
		PlaylistAPI.getPlaylist = getPlaylist;
		PlaylistAPI.getContents = getContents;
	};
}
