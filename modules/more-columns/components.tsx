import { React } from "/modules/stdlib/src/expose/React.ts";
import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.xpui.js";
import { db } from "/modules/Delusoire.library-db/lib/db.ts";
import { useLiveQuery } from "/modules/Delusoire.dexie-react-hooks/mod.ts";
import { lfmTracksCache } from "./patchPlaylistApi.ts";

const Playcount = React.memo(
	({ uri, albumUri }: { uri: string; albumUri: string }) => {
		const album = useLiveQuery(async () => {
			const t = await db.albums.get(albumUri);
			return t;
		}, [albumUri]);

		const albumTracks = album?.tracks.items.map((w) => w.track);
		const playcount = albumTracks?.find((track) => track.uri === uri)?.playcount ?? -1;

		return (
			<UI.Text as="div" variant="bodySmall" className="HxDMwNr5oCxTOyqt85gi">
				{Number(playcount).toLocaleString()}
			</UI.Text>
		);
	},
);

const ReleaseDate = React.memo(
	({ uri, albumUri }: { uri: string; albumUri: string }) => {
		const album = useLiveQuery(async () => {
			const t = await db.albums.get(albumUri);
			return t;
		}, [albumUri]);

		const releaseDate = album?.date.isoString ?? null;

		return (
			<UI.Text as="div" variant="bodySmall" className="HxDMwNr5oCxTOyqt85gi">
				{new Date(releaseDate).toLocaleString()}
			</UI.Text>
		);
	},
);

const Popularity = React.memo(
	({ uri }: { uri: string }) => {
		const webTrack = useLiveQuery(async () => {
			const t = await db.tracks.get(uri);
			return t;
		}, [uri]);

		const popularity = webTrack?.popularity ?? -1;

		return (
			<UI.Text as="div" variant="bodySmall" className="HxDMwNr5oCxTOyqt85gi">
				{popularity}%
			</UI.Text>
		);
	},
);

const Scrobbles = React.memo(
	({ uri }: { uri: string }) => {
		const lfmTrack = lfmTracksCache.get(uri);

		const scrobbles = lfmTrack?.userplaycount ?? -1;

		return (
			<UI.Text as="div" variant="bodySmall" className="HxDMwNr5oCxTOyqt85gi">
				{Number(scrobbles).toLocaleString()}
			</UI.Text>
		);
	},
);

export const PlaycountWrapper = React.memo(({ data }: any) => {
	const uri = data.uri;
	const albumUri = data.album.uri;
	return uri && albumUri && <Playcount uri={uri} albumUri={albumUri} />;
});

export const ReleaseDateWrapper = React.memo(({ data }: any) => {
	const uri = data.uri;
	const albumUri = data.album.uri;
	return uri && albumUri && <ReleaseDate uri={uri} albumUri={albumUri} />;
});

export const PopularityWrapper = React.memo(({ data }: any) => {
	const uri = data.uri;
	const albumUri = data.album.uri;
	return uri && albumUri && <Popularity uri={uri} />;
});

export const ScrobblesWrapper = React.memo(({ data }: any) => {
	const uri = data.uri;
	const albumUri = data.album.uri;
	return uri && albumUri && <Scrobbles uri={uri} />;
});
