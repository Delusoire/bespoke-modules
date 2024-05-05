import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import { _ } from "/modules/Delusoire/stdlib/deps.js";
import { normalizeStr } from "/modules/Delusoire/delulib/lib/util.js";

import { xfetch } from "/modules/Delusoire/stdlib/lib/window.js";

import { Innertube, UniversalCache } from "https://esm.sh/youtubei.js/web.bundle.min";
const yt = await Innertube.create({
	cache: new UniversalCache(false),
	fetch: async (input, init) =>
		xfetch(input, init, (_, init) => {
			const headers = init.headers as Headers;
			if (!headers.has("Origin")) {
				headers.set("Origin", "https://www.youtube.com");
			}
		}),
});

import { S } from "/modules/Delusoire/stdlib/index.js";

const { URI } = S;

const YTVidIDCache = new Map<string, string>();

export const showOnYouTube = async (uri: string) => {
	const id = URI.fromString(uri).id;
	if (!YTVidIDCache.get(id)) {
		const track = await spotifyApi.tracks.get(id);
		const artists = track.artists.map(artist => artist.name);
		const nonFeatArtists = artists.filter(artist => !track.name.includes(artist));
		const searchString = `${nonFeatArtists.join(", ")} - ${track.name} [Official Music Video]`;

		try {
			const { videos } = await yt.search(searchString, { sort_by: "relevance", type: "video" });

			const normalizedTrackName = normalizeStr(track.name);
			const video =
				videos.find(video => {
					normalizeStr(video.title.text).includes(normalizedTrackName);
				}) ?? videos[0];

			YTVidIDCache.set(id, video.id);

			window.open(`https://www.youtube.com/watch?v=${video.id}`);
		} catch (_) {
			window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchString)}`);
		}
	}
};
