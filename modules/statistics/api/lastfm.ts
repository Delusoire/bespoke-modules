import type { ValueOf } from "../util/types.ts";
import type { SpotifyTimeRange } from "./spotify.ts";
import { LFMTopAlbums } from "./types/LFMTopAlbums.ts";
import { LFMTopArtists } from "./types/LFMTopArtists.ts";
import { LFMTopTracks } from "./types/LFMTopTracks.ts";

const SpotifyToLFMTimerange = {
	short_term: "1month",
	medium_term: "6month",
	long_term: "overall",
} as const;

const LFMEndpoint = "https://ws.audioscrobbler.com/2.0/";

export const fetchLFMTopTracks = (key: string) => (username: string, range: keyof typeof SpotifyTimeRange) => {
	const url = new URL(LFMEndpoint);

	url.searchParams.append("method", "user.getTopTracks");
	url.searchParams.append("user", username);
	url.searchParams.append("api_key", key);
	url.searchParams.append("format", "json");
	url.searchParams.append("period", SpotifyToLFMTimerange[range]);

	return fetch(url).then((res) => res.json() as Promise<LFMTopTracks>);
};

export const fetchLFMTopAlbums =
	(key: string) => (username: string, range: ValueOf<typeof SpotifyTimeRange>) => {
		const url = new URL(LFMEndpoint);

		url.searchParams.append("method", "user.getTopAlbums");
		url.searchParams.append("user", username);
		url.searchParams.append("api_key", key);
		url.searchParams.append("format", "json");
		url.searchParams.append("period", SpotifyToLFMTimerange[range]);

		return fetch(url).then((res) => res.json() as Promise<LFMTopAlbums>);
	};

export const fetchLFMTopArtists = (key: string) => (username: string, range: keyof typeof SpotifyTimeRange) => {
	const url = new URL(LFMEndpoint);

	url.searchParams.append("method", "user.getTopArtists");
	url.searchParams.append("user", username);
	url.searchParams.append("api_key", key);
	url.searchParams.append("format", "json");
	url.searchParams.append("period", SpotifyToLFMTimerange[range]);

	return fetch(url).then((res) => res.json() as Promise<LFMTopArtists>);
};
