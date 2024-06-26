import type { Track } from "https://esm.sh/@fostertheweb/spotify-web-api-ts-sdk";

export type TrackData = {
	uri: string;
	uid?: string;
	name: string;
	albumUri: string;
	albumName?: string;
	artistUris: string[];
	artistName: string;
	durationMilis: number;
	playcount?: number;
	popularity?: number;
	releaseDate?: number;
	lastfmPlaycount?: number;
	scrobbles?: number;
	personalScrobbles?: number;
};

export const parseTopTrackFromArtist = ({ track }: TopTracksItem) => ({
	uri: track.uri,
	uid: undefined,
	name: track.name,
	albumUri: track.albumOfTrack.uri,
	albumName: undefined,
	artistUris: track.artists.items.map((artist) => artist.uri),
	artistName: track.artists.items[0].profile.name,
	durationMilis: track.duration.totalMilliseconds,
	playcount: Number(track.playcount),
	popularity: undefined,
	releaseDate: undefined,
});

export const parseArtistLikedTrack = (track: Platform.Track) => ({
	uri: track.uri,
	uid: undefined,
	name: track.name,
	albumUri: track.album.uri,
	albumName: track.album.name,
	artistUris: track.artists.map((artist) => artist.uri),
	artistName: track.artists[0].name,
	durationMilis: track.duration.milliseconds,
	playcount: undefined,
	popularity: undefined,
	releaseDate: undefined,
});

export const parsePlaylistAPITrack = (track: Platform.PlaylistAPI.Track) => ({
	uri: track.uri,
	uid: track.uid,
	name: track.name,
	albumUri: track.album.uri,
	albumName: track.album.name,
	artistUris: track.artists.map((artist) => artist.uri),
	artistName: track.artists[0].name,
	durationMilis: track.duration.milliseconds,
	playcount: undefined,
	popularity: undefined,
	releaseDate: undefined,
});

export const parseWebAPITrack = (track: Track) => ({
	uri: track.uri,
	uid: undefined,
	name: track.name,
	albumUri: track.album.uri,
	albumName: track.album.name,
	artistUris: track.artists.map((artist) => artist.uri),
	artistName: track.artists[0].name,
	durationMilis: track.duration_ms,
	playcount: undefined,
	popularity: track.popularity,
	releaseDate: new Date(track.album.release_date).getTime(),
});

export const parseLibraryAPILikedTracks = (track: Platform.Track) => ({
	uri: track.uri,
	uid: undefined,
	name: track.name,
	albumUri: track.album.uri,
	albumName: track.album.name,
	artistUris: track.artists.map((artist) => artist.uri),
	artistName: track.artists[0].name,
	durationMilis: track.duration.milliseconds,
	playcount: undefined,
	popularity: undefined,
	releaseDate: undefined,
});
