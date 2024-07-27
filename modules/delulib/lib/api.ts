import { type AccessToken, SpotifyApi } from "https://esm.sh/@fostertheweb/spotify-web-api-ts-sdk";
import { _ } from "/modules/stdlib/deps.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { getConcurrentExecutionLimiterWrapper } from "./fp.ts";

const getAccessToken = () => Platform.getAuthorizationAPI().getState().token.accessToken;

export const spotifyApi = SpotifyApi.withAccessToken(undefined, {} as AccessToken, {
	beforeRequest(_, opts) {
		(opts.headers as any).Authorization = `Bearer ${getAccessToken()}`;
	},
});

/*                          Last FM                                       */

export interface fetchLastFMTrackResMinimal {
	track: {
		name: string;
		mbid: string;
		url: string;
		duration: string;
		listeners: string;
		playcount: string;
		artist: {
			name: string;
			mbid: string;
			url: string;
		};
		album: {
			artist: string;
			title: string;
			mbid: string;
			url: string;
		};
		userplaycount: string;
		userloved: string;
		toptags: {
			tag: Array<{
				name: string;
				url: string;
			}>;
		};
		wiki: {
			published: string;
			summary: string;
			content: string;
		};
	};
}

export const fetchLastFMTrack = getConcurrentExecutionLimiterWrapper(1000)(
	async (LFMApiKey: string, artist: string, trackName: string, lastFmUsername = "") => {
		const url = new URL("https://ws.audioscrobbler.com/2.0/");
		url.searchParams.append("method", "track.getInfo");
		url.searchParams.append("api_key", LFMApiKey);
		url.searchParams.append("artist", artist);
		url.searchParams.append("track", trackName);
		url.searchParams.append("format", "json");
		url.searchParams.append("username", lastFmUsername);

		const res: fetchLastFMTrackResMinimal = await fetch(url).then((res) => res.json());

		return res.track;
	},
);
