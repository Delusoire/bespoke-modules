import { fetchAlbumTracks } from "/modules/Delusoire.delulib/lib/GraphQL/fetchAlbumTracks.ts";
import { fetchArtistDiscography } from "/modules/Delusoire.delulib/lib/GraphQL/fetchArtistDiscography.ts";
import { fetchArtistOverview } from "/modules/Delusoire.delulib/lib/GraphQL/fetchArtistOveriew.ts";
import { _, fp } from "/modules/stdlib/deps.ts";
import { pMchain } from "/modules/Delusoire.delulib/lib/fp.ts";
import {
	parseArtistLikedTrack,
	parseLibraryAPILikedTracks,
	parsePlaylistAPITrack,
	parseTopTrackFromArtist,
	type TrackData,
} from "/modules/Delusoire.delulib/lib/parse.ts";
import {
	fetchArtistLikedTracks,
	fetchLikedTracks,
	fetchPlaylistContents,
} from "/modules/Delusoire.delulib/lib/platform.ts";

import { CONFIG } from "./settings.ts";

import { is } from "/modules/stdlib/src/webpack/URI.ts";
import { is_LikedTracks } from "./util.ts";

export const getTracksFromAlbum = async (uri: string) => {
	const albumRes = await fetchAlbumTracks(uri);

	const filler = {
		albumUri: uri as string,
	};

	const tracks = albumRes.tracks.items as any[];

	return Promise.all(
		tracks.map(async ({ track }) => {
			const artists = track.artists.items as any[];
			return Object.assign({
				uri: track.uri as string,
				name: track.name as string,
				artistUris: artists.map((a) => a.uri as string),
				artistName: artists[0].profile.name as string,
				durationMilis: Number(track.duration.totalMilliseconds),
				playcount: Number(track.playcount),
			}, filler);
		}),
	);
};

export const getLikedTracks = _.flow(fetchLikedTracks, pMchain(fp.map(parseLibraryAPILikedTracks)));

export const getTracksFromPlaylist = _.flow(
	fetchPlaylistContents,
	pMchain(fp.map(parsePlaylistAPITrack)),
	pMchain(fp.filter((track) => !is.LocalTrack(track.uri))),
);

export const getTracksFromArtist = async (uri: string) => {
	const allTracks = new Array<TrackData>();

	const itemsWithCountAr = new Array<ItemsWithCount<ItemMin>>();
	const itemsReleasesAr = new Array<ItemsReleases<ItemMin>>();
	const appearsOnAr = new Array<ItemsReleasesWithCount<ItemMin>>();

	if (CONFIG.artistAllDiscography) {
		const items = await fetchArtistDiscography(uri);
		itemsReleasesAr.push({ items, totalCount: Infinity });
	} else {
		const { discography, relatedContent } = await fetchArtistOverview(uri);

		CONFIG.artistLikedTracks &&
			allTracks.push(...(await fetchArtistLikedTracks(uri)).map(parseArtistLikedTrack));
		CONFIG.artistTopTracks && allTracks.push(...discography.topTracks.items.map(parseTopTrackFromArtist));
		CONFIG.artistPopularReleases && itemsWithCountAr.push(discography.popularReleasesAlbums);
		CONFIG.artistSingles && itemsReleasesAr.push(discography.singles);
		CONFIG.artistAlbums && itemsReleasesAr.push(discography.albums);
		CONFIG.artistCompilations && itemsReleasesAr.push(discography.compilations);
		CONFIG.artistAppearsOn && appearsOnAr.push(relatedContent.appearsOn);
	}

	const items1 = itemsWithCountAr.flatMap((iwc) => iwc.items);
	const items2 = itemsReleasesAr.flatMap((ir) => ir.items.flatMap((i) => i.releases.items));
	const albumLikeUris = items1.concat(items2).map((item) => item.uri);
	const albumsTracks = await Promise.all(albumLikeUris.map(getTracksFromAlbum));

	const appearsOnUris = appearsOnAr.flatMap((ir) => ir.items.flatMap((i) => i.releases.items)).map((item) =>
		item.uri
	);
	const appearsOnTracks = await Promise.all(appearsOnUris.map(getTracksFromAlbum));

	allTracks.push(
		...albumsTracks.flat(),
		...appearsOnTracks.flat().filter((track) => track.artistUris.includes(uri)),
	);
	return await Promise.all(allTracks);
};

export const getTracksFromUri = _.cond([
	[is.Album, getTracksFromAlbum],
	[is.Artist, getTracksFromArtist],
	[is_LikedTracks, getLikedTracks],
	[is.PlaylistV1OrV2, getTracksFromPlaylist],
]);
