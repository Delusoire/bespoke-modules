import { is } from "/modules/stdlib/src/webpack/URI.ts";
import { getAlbumsFromURIs, getTracksFromURIs } from "/modules/Delusoire.library-db/lib/db.ts";
import {
	PLAYCOUNT_SORT_FIELD,
	POPULARITY_SORT_FIELD,
	RELEASE_DATE_SORT_FIELD,
	SCROBBLES_SORT_FIELD,
} from "./columns.ts";
import { fetchLastFMTrack } from "/modules/Delusoire.delulib/lib/api.ts";
import { CONFIG } from "./settings.ts";

export const lfmTracksCache = new Map<string, any>();
export const getLFMTracks = async (tracks: any[]) => {
	const uris = tracks.map((track) => track.uri);
	const objs = uris.map((uri) => lfmTracksCache.get(uri));
	const missed = objs.reduce<number[]>((missed, obj, i) => {
		obj ?? missed.push(i);
		return missed;
	}, []);

	const missedUniq = Object.groupBy(missed, (i) => uris[i]);
	const missedUniqTracks = Object.values(missedUniq).map((js) => tracks[js![0]]);

	if (missedUniqTracks.length) {
		const fillers = await Promise.all(
			missedUniqTracks.map((track) =>
				fetchLastFMTrack(CONFIG.LFMApiKey, track.artists[0].name, track.name, CONFIG.lastFmUsername)
			),
		);
		missedUniqTracks.forEach((t, i) => {
			lfmTracksCache.set(t.uri, fillers[i]);
			const js = missedUniq[t.uri]!;
			for (const j of js) {
				objs[j] = fillers[i];
			}
		});
	}

	return objs;
};

export async function patchPlaylistContents(contents: any, opts: any) {
	const items = (contents.items as any[]).filter((track) => is.Track(track.uri) && !is.LocalTrack(track.uri));

	let order: ((a: any, b: any) => number) | undefined;

	const isPlaycountSort = opts?.sort?.field === PLAYCOUNT_SORT_FIELD;
	const isReleaseDateSort = opts?.sort?.field === RELEASE_DATE_SORT_FIELD;
	const isPopularitySort = opts?.sort?.field === POPULARITY_SORT_FIELD;
	const isScrobblesSort = opts?.sort?.field === SCROBBLES_SORT_FIELD;

	const needsAlbumData = CONFIG.enablePlaycount || CONFIG.enableReleaseDate || isPlaycountSort ||
		isReleaseDateSort;
	const needsLFMData = CONFIG.enableScrobbles || isScrobblesSort;
	const needsWebTrackData = CONFIG.enablePopularity || isPopularitySort;

	if (needsAlbumData) {
		const albumUris = items.map((track) => track.album.uri);
		const albums = await getAlbumsFromURIs(albumUris);
		items.forEach((track, i) => {
			const album = albums[i];
			const albumTracks = album.tracks.items.map((w) => w.track);
			const albumTrack = albumTracks.find((albumTrack) => albumTrack.uri === track.uri);
			track.albumAlbum = album;
			track.albumTrack = albumTrack;
		});
		if (isPlaycountSort) {
			const p = (track) => Number(track.albumTrack.playcount ?? -1);
			order = (a, b) => p(a) - p(b);
		} else if (isReleaseDateSort) {
			const p = (track) => new Date(track.albumTrack.date.isoString);
			order = (a, b) => p(a) - p(b);
		}
	}

	if (needsWebTrackData) {
		const uris = items.map((track) => track.uri);
		const webTracks = await getTracksFromURIs(uris);
		items.forEach((track, i) => {
			const webTrack = webTracks[i];
			track.webTrack = webTrack;
		});
		if (isPopularitySort) {
			const p = (track) => Number(track.webTrack.popularity ?? -1);
			order = (a, b) => p(a) - p(b);
		}
	}

	if (needsLFMData) {
		const lfmTracks = await getLFMTracks(items);
		items.forEach((track, i) => {
			const lfmTrack = lfmTracks[i];
			track.lfmTrack = lfmTrack;
		});
		if (isScrobblesSort) {
			const p = (track) => Number(track.lfmTrack.userplaycount ?? -1);
			order = (a, b) => p(a) - p(b);
		}
	}

	if (order) {
		const sortedItems = items.toSorted(order);
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
