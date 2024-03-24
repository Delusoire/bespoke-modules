import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import { normalizeStr } from "/modules/Delusoire/delulib/lib/util.js";
import { Innertube, UniversalCache } from "https://esm.sh/youtubei.js/web.bundle.min";
const yt = await Innertube.create({
    cache: new UniversalCache(false),
    fetch: async (input, init)=>{
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const headers = init?.headers ? new Headers(init.headers) : input instanceof Request ? input.headers : new Headers();
        if (headers.has("X-Origin")) {
            headers.set("Origin", headers.get("X-Origin"));
            headers.delete("X-Origin");
        }
        init ??= {};
        const _headers = new Headers();
        _headers.set("X-Set-Headers", JSON.stringify(Object.fromEntries(headers.entries())));
        init.headers = _headers;
        if (input instanceof Request) {
            // @ts-ignore
            input.duplex = "half";
        }
        const request = new Request(`https://bespoke-proxy.delusoire.workers.dev/${url}`, input instanceof Request ? input : undefined);
        return fetch(request, init);
    }
});
import { S } from "/modules/Delusoire/stdlib/index.js";
const { URI } = S;
const YTVidIDCache = new Map();
export const showOnYouTube = async (uri)=>{
    const id = URI.fromString(uri).id;
    if (!YTVidIDCache.get(id)) {
        const track = await spotifyApi.tracks.get(id);
        const artists = track.artists.map((artist)=>artist.name);
        const nonFeatArtists = artists.filter((artist)=>!track.name.includes(artist));
        const searchString = `${nonFeatArtists.join(", ")} - ${track.name} [Official Music Video]`;
        try {
            const { videos } = await yt.search(searchString, {
                sort_by: "relevance",
                type: "video"
            });
            const normalizedTrackName = normalizeStr(track.name);
            const video = videos.find((video)=>{
                normalizeStr(video.title.text).includes(normalizedTrackName);
            }) ?? videos[0];
            YTVidIDCache.set(id, video.id);
            window.open(`https://www.youtube.com/watch?v=${video.id}`);
        } catch (_) {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchString)}`);
        }
    }
};
