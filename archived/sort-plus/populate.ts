import { fetchLastFMTrack, spotifyApi } from "/modules/Delusoire.delulib/lib/api.ts";
import { _, fp } from "/modules/stdlib/deps.ts";
import { chunkify, progressify } from "/modules/Delusoire.delulib/lib/fp.ts";
import { parseWebAPITrack, TrackData } from "/modules/Delusoire.delulib/lib/parse.ts";

import { getTracksFromAlbum } from "./fetch.ts";
import { CONFIG } from "./settings.ts";
import { joinByUri, SortAction, SortActionProp } from "./util.ts";
import { fromString } from "/modules/stdlib/src/webpack/URI.ts";

const fillTracksFromWebAPI = async (tracks: TrackData[]) => {
	const ids = tracks.map((track) => fromString(track.uri)!.id!);

	const fetchedTracks = await chunkify(ids, (x) => spotifyApi.tracks.get(x), 50);
	return joinByUri(tracks, fetchedTracks.map(parseWebAPITrack));
};

const fillTracksFromAlbumTracks = async (tracks: TrackData[]) => {
	const tracksByAlbumUri = Object.groupBy(tracks, (track) => track.albumUri);
	const passes = Object.keys(tracksByAlbumUri).length;
	const fn = progressify(async (tracks: TrackData[]) => {
		const albumTracks = await getTracksFromAlbum(tracks[0].albumUri);
		const newTracks = _.intersectionBy(albumTracks, tracks, (track) => track.uri);
		return joinByUri(tracks, newTracks);
	}, passes);

	const sameAlbumTracksArray = Object.values(tracksByAlbumUri);
	const albumsTracks = await Promise.all(sameAlbumTracksArray.map(fn));
	return albumsTracks.flat();
};

export const fillTracksFromSpotify = (propName: SortAction) => async (tracks: TrackData[]) => {
	const tracksMissing = tracks.filter((track) => track[SortActionProp[propName]] == null);
	const tracksPopulater = _.cond([
		[fp.startsWith(SortAction.SPOTIFY_PLAYCOUNT), () => fillTracksFromAlbumTracks],
		[_.stubTrue, () => fillTracksFromWebAPI],
	])(propName);
	const filledTracks = await tracksPopulater(tracksMissing);
	return joinByUri(tracks, filledTracks);
};

const fillTrackFromLastFM = async (track: TrackData) => {
	const lastfmTrack = await fetchLastFMTrack(
		CONFIG.LFMApiKey,
		track.artistName,
		track.name,
		CONFIG.lastFmUsername,
	);
	track.lastfmPlaycount = Number(lastfmTrack.listeners);
	track.scrobbles = Number(lastfmTrack.playcount);
	track.personalScrobbles = Number(lastfmTrack.userplaycount);
	return track;
};

export const fillTracksFromLastFM = (tracks: TrackData[]) => {
	const fn = progressify(fillTrackFromLastFM, tracks.length);
	return Promise.all(tracks.map(fn));
};
