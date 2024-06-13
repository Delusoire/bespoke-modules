import { fetchLastFMTrack, spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import { waitForElement } from "/modules/official/stdlib/lib/dom.js";
import { CONFIG } from "./settings.js";
import { fetchArtistRelated } from "/modules/Delusoire/delulib/lib/GraphQL/fetchArtistRelated.js";
import { _ } from "/modules/official/stdlib/deps.js";
import "./components.js";
import { eventBus } from "./index.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { fromString, is } from "/modules/official/stdlib/src/webpack/URI.js";
const PlayerAPI = Platform.getPlayerAPI();
const fetchLastFMTagsForNowPlayingTrack = async ()=>{
    const item = PlayerAPI.getState().item;
    if (item === null) return [];
    const track = await fetchLastFMTrack(CONFIG.LFMApiKey, item.artists[0].name, item.name);
    const tags = track.toptags.tag.map((tag)=>tag.name);
    const deletedTagRegex = /^-\d{13}$/;
    const blacklistedTags = [
        "MySpotigramBot"
    ];
    return tags.filter((tag)=>!deletedTagRegex.test(tag) && !blacklistedTags.includes(tag));
};
const nowPlayingGenreContainerEl = document.createElement("genre-container");
nowPlayingGenreContainerEl.fetchGenres = fetchLastFMTagsForNowPlayingTrack;
nowPlayingGenreContainerEl.className += " ellipsis-one-line main-type-finale";
nowPlayingGenreContainerEl.style.gridArea = "genres";
(async ()=>{
    const trackInfoContainer = await waitForElement(".iZrIHsls0lCEhoMDA9kc");
    trackInfoContainer.appendChild(nowPlayingGenreContainerEl);
})();
eventBus.Player.song_changed.subscribe((state)=>{
    nowPlayingGenreContainerEl.uri = state.item?.uri;
});
const getArtistsGenresOrRelated = async (artistsUris)=>{
    const getArtistsGenres = async (artistsUris)=>{
        const ids = artistsUris.map((uri)=>fromString(uri).id);
        const artists = await spotifyApi.artists.get(_.compact(ids));
        const genres = new Set(artists.flatMap((artist)=>artist.genres));
        return Array.from(genres);
    };
    const allGenres = await getArtistsGenres(artistsUris);
    if (allGenres.length) return allGenres;
    const relatedArtists = await fetchArtistRelated(artistsUris[0]);
    relatedArtists.map((artist)=>artist.uri);
    if (allGenres.length) return allGenres;
    const artistRelated = await fetchArtistRelated(artistsUris[0]);
    return _.chunk(artistRelated.map((a)=>a.uri), 5).reduce(async (acc, arr5uris)=>(await acc).length ? await acc : await getArtistsGenres(arr5uris), Promise.resolve([]));
};
const updateArtistPage = async (uri)=>{
    const artistGenreContainerEl = document.createElement("genre-container");
    artistGenreContainerEl.name = "Artist Genres";
    artistGenreContainerEl.uri = uri.toString();
    artistGenreContainerEl.fetchGenres = (uri)=>getArtistsGenresOrRelated([
            uri
        ]);
    const lastHeaderTextEl = document.querySelector(".RP2rRchy4i8TIp1CTmb7");
    const headerTextEl = await waitForElement(".RP2rRchy4i8TIp1CTmb7", undefined, undefined, lastHeaderTextEl);
    const headerTextDetailsEl = await waitForElement(".Ydwa1P5GkCggtLlSvphs");
    headerTextEl.insertBefore(artistGenreContainerEl, headerTextDetailsEl);
};
eventBus.History.updated.subscribe(({ pathname })=>{
    try {
        const uri = fromString(pathname);
        if (is.Artist(uri)) {
            updateArtistPage(uri);
        }
    } catch (_) {}
});