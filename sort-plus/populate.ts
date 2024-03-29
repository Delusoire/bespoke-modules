import { fetchLastFMTrack, spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import { _, fp } from "/modules/Delusoire/stdlib/deps.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
import { chunkify50, progressify } from "/modules/Delusoire/delulib/lib/fp.js";
import { TrackData, parseWebAPITrack } from "/modules/Delusoire/delulib/lib/parse.js";

import { getTracksFromAlbum } from "./fetch.js";
import { CONFIG } from "./settings.js";
import { SortAction, SortActionProp, joinByUri } from "./util.js";

const { URI } = S;

const fillTracksFromWebAPI = async (tracks: TrackData[]) => {
	const ids = tracks.map(track => URI.fromString(track.uri)!.id!);

	const fetchedTracks = await chunkify50(is => spotifyApi.tracks.get(is))(ids);
	return joinByUri(tracks, fetchedTracks.map(parseWebAPITrack));
};

const fillTracksFromAlbumTracks = async (tracks: TrackData[]) => {
	const tracksByAlbumUri = Object.groupBy(tracks, track => track.albumUri);
	const passes = Object.keys(tracksByAlbumUri).length;
	const fn = progressify(async (tracks: TrackData[]) => {
		const albumTracks = await getTracksFromAlbum(tracks[0].albumUri);
		const newTracks = _.intersectionBy(albumTracks, tracks, track => track.uri);
		return joinByUri(tracks, newTracks);
	}, passes);

	const sameAlbumTracksArray = Object.values(tracksByAlbumUri);
	const albumsTracks = await Promise.all(sameAlbumTracksArray.map(fn));
	return albumsTracks.flat();
};

export const fillTracksFromSpotify = (propName: SortAction) => async (tracks: TrackData[]) => {
	const tracksMissing = tracks.filter(track => track[SortActionProp[propName]] == null);
	const tracksPopulater = _.cond([
		[fp.startsWith(SortAction.SPOTIFY_PLAYCOUNT), () => fillTracksFromAlbumTracks],
		[_.stubTrue, () => fillTracksFromWebAPI],
	])(propName);
	const filledTracks = await tracksPopulater(tracksMissing);
	return joinByUri(tracks, filledTracks);
};

const fillTrackFromLastFM = async (track: TrackData) => {
	const lastfmTrack = await fetchLastFMTrack(CONFIG.LFMApiKey, track.artistName, track.name, CONFIG.lastFmUsername);
	track.lastfmPlaycount = Number(lastfmTrack.listeners);
	track.scrobbles = Number(lastfmTrack.playcount);
	track.personalScrobbles = Number(lastfmTrack.userplaycount);
	return track;
};

export const fillTracksFromLastFM = (tracks: TrackData[]) => {
	const fn = progressify(fillTrackFromLastFM, tracks.length);
	return Promise.all(tracks.map(fn));
};
