import { fetchArtistDiscography } from "/modules/Delusoire.delulib/lib/GraphQL/fetchArtistDiscography.ts";
import { fetchArtistOverview } from "/modules/Delusoire.delulib/lib/GraphQL/fetchArtistOveriew.ts";
import {
	parseArtistLikedTrack,
	parseTopTrackFromArtist,
	type TrackData,
} from "/modules/Delusoire.delulib/lib/parse.ts";
import {
	fetchArtistLikedTracks,
} from "/modules/Delusoire.delulib/lib/platform.ts";

import { CONFIG } from "./settings.ts";
import { getAlbumsFromURIs } from "/modules/Delusoire.library-db/lib/db.ts";

const getTracksFromAlbums = async (uris: string[]) => {
	const albums = await getAlbumsFromURIs(uris);

	return Promise.all(albums.map((album, i) => {
		const filler = {
			albumUri: uris[i],
		};

		const tracks = album.tracks.items as any[];

		return Promise.all(
			tracks.map(({ track }) => {
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
	}));
};

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
			allTracks.push(
				...(await fetchArtistLikedTracks(uri)).map(parseArtistLikedTrack),
			);
		CONFIG.artistTopTracks &&
			allTracks.push(
				...discography.topTracks.items.map(parseTopTrackFromArtist),
			);
		CONFIG.artistPopularReleases &&
			itemsWithCountAr.push(discography.popularReleasesAlbums);
		CONFIG.artistSingles && itemsReleasesAr.push(discography.singles);
		CONFIG.artistAlbums && itemsReleasesAr.push(discography.albums);
		CONFIG.artistCompilations &&
			itemsReleasesAr.push(discography.compilations);
		CONFIG.artistAppearsOn && appearsOnAr.push(relatedContent.appearsOn);
	}

	const items1 = itemsWithCountAr.flatMap((iwc) => iwc.items);
	const items2 = itemsReleasesAr.flatMap((ir) =>
		ir.items.flatMap((i) => i.releases.items)
	);
	const albumLikeUris = items1.concat(items2).map((item) => item.uri);
	const albumsTracks = await getTracksFromAlbums(albumLikeUris);

	const appearsOnUris = appearsOnAr.flatMap((ir) =>
		ir.items.flatMap((i) => i.releases.items)
	).map((item) => item.uri);
	const appearsOnTracks = await getTracksFromAlbums(appearsOnUris);

	allTracks.push(
		...albumsTracks.flat(),
		...appearsOnTracks.flat().filter((track) =>
			track.artistUris.includes(uri)
		),
	);
	return await Promise.all(allTracks);
};
