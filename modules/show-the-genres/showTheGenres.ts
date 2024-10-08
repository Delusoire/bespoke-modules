import { fetchLastFMTrack, spotifyApi } from "/modules/Delusoire.delulib/lib/api.ts";
import { waitForElement } from "/modules/stdlib/lib/dom.ts";

import { CONFIG } from "./settings.ts";

import { fetchArtistRelated } from "/modules/Delusoire.delulib/lib/GraphQL/fetchArtistRelated.ts";
import "./components.ts";
import { eventBus } from "./mod.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { fromString, is } from "/modules/stdlib/src/webpack/URI.ts";
import { chunk } from "/hooks/std/collections.ts";

const PlayerAPI = Platform.getPlayerAPI();

const fetchLastFMTagsForNowPlayingTrack = async () => {
	const item = PlayerAPI.getState().item;
	if (item === null) return [];
	const track = await fetchLastFMTrack(CONFIG.LFMApiKey, item.artists[0].name, item.name);
	const tags = track.toptags.tag.map((tag) => tag.name);

	const deletedTagRegex = /^-\d{13}$/;
	const blacklistedTags = ["MySpotigramBot"];
	return tags.filter((tag) => !deletedTagRegex.test(tag) && !blacklistedTags.includes(tag));
};

export const nowPlayingGenreContainerEl = document.createElement("genre-container");
nowPlayingGenreContainerEl.fetchGenres = fetchLastFMTagsForNowPlayingTrack;
nowPlayingGenreContainerEl.className += " ellipsis-one-line main-type-finale";
nowPlayingGenreContainerEl.style.gridArea = "genres";
(async () => {
	const trackInfoContainer = await waitForElement(".iZrIHsls0lCEhoMDA9kc");
	trackInfoContainer.appendChild(nowPlayingGenreContainerEl);
})();

eventBus.Player.song_changed.subscribe((state) => {
	nowPlayingGenreContainerEl.uri = state?.item?.uri;
});

const getArtistsGenresOrRelated = async (artistsUris: string[]) => {
	const getArtistsGenres = async (artistsUris: string[]) => {
		const ids = artistsUris.map((uri) => fromString(uri).id as string);
		const artists = await spotifyApi.artists.get(ids.filter(Boolean));
		const genres = new Set(artists.flatMap((artist) => artist.genres));
		return Array.from(genres);
	};

	const allGenres = await getArtistsGenres(artistsUris);

	if (allGenres.length) return allGenres;

	const relatedArtists = await fetchArtistRelated(artistsUris[0]);

	relatedArtists.map((artist) => artist.uri);

	if (allGenres.length) return allGenres;

	const artistRelated: any[] = await fetchArtistRelated(artistsUris[0]);

	return chunk(artistRelated.map((a) => a.uri as string), 5)
		.reduce(
			async (acc, arr5uris) => ((await acc).length ? acc : await getArtistsGenres(arr5uris)),
			Promise.resolve([] as string[]),
		);
};

const updateArtistPage = async (uri: string) => {
	const artistGenreContainerEl = document.createElement("genre-container");
	artistGenreContainerEl.name = "Artist Genres";
	artistGenreContainerEl.uri = uri.toString();
	artistGenreContainerEl.fetchGenres = (uri) => getArtistsGenresOrRelated([uri]);

	const lastHeaderTextEl = document.querySelector(".RP2rRchy4i8TIp1CTmb7");
	const headerTextEl = await waitForElement(
		".RP2rRchy4i8TIp1CTmb7",
		undefined,
		undefined,
		lastHeaderTextEl,
	);
	const headerTextDetailsEl = await waitForElement(".Ydwa1P5GkCggtLlSvphs");
	headerTextEl.insertBefore(artistGenreContainerEl, headerTextDetailsEl);
};

eventBus.History.updated.subscribe(({ pathname }) => {
	try {
		const uri = fromString(pathname);
		if (is.Artist(uri)) {
			updateArtistPage(uri);
		}
	} catch (_) {}
});
