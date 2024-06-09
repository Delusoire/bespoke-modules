import { fetchAlbumTracks } from "../delulib/lib/GraphQL/fetchAlbumTracks.js";
import { fetchArtistDiscography } from "/modules/Delusoire/delulib/lib/GraphQL/fetchArtistDiscography.js";
import { fetchArtistOverview } from "/modules/Delusoire/delulib/lib/GraphQL/fetchArtistOveriew.js";
import { _, fp } from "/modules/official/stdlib/deps.js";
import { pMchain } from "/modules/Delusoire/delulib/lib/fp.js";
import { parseArtistLikedTrack, parseLibraryAPILikedTracks, parsePlaylistAPITrack, parseTopTrackFromArtist } from "/modules/Delusoire/delulib/lib/parse.js";
import { fetchArtistLikedTracks, fetchLikedTracks, fetchPlaylistContents } from "/modules/Delusoire/delulib/lib/platform.js";
import { CONFIG } from "./settings.js";
import { is } from "/modules/official/stdlib/src/webpack/URI.js";
import { is_LikedTracks } from "./util.js";
export const getTracksFromAlbum = async (uri)=>{
    const albumRes = await fetchAlbumTracks(uri);
    const filler = {
        albumUri: uri
    };
    const tracks = albumRes.tracks.items;
    return Promise.all(tracks.map(async ({ track })=>{
        const artists = track.artists.items;
        return Object.assign({
            uri: track.uri,
            name: track.name,
            artistUris: artists.map((a)=>a.uri),
            artistName: artists[0].profile.name,
            durationMilis: Number(track.duration.totalMilliseconds),
            playcount: Number(track.playcount)
        }, filler);
    }));
};
export const getLikedTracks = _.flow(fetchLikedTracks, pMchain(fp.map(parseLibraryAPILikedTracks)));
export const getTracksFromPlaylist = _.flow(fetchPlaylistContents, pMchain(fp.map(parsePlaylistAPITrack)), pMchain(fp.filter((track)=>!is.LocalTrack(track.uri))));
export const getTracksFromArtist = async (uri)=>{
    const allTracks = new Array();
    const itemsWithCountAr = new Array();
    const itemsReleasesAr = new Array();
    const appearsOnAr = new Array();
    if (CONFIG.artistAllDiscography) {
        const items = await fetchArtistDiscography(uri);
        itemsReleasesAr.push({
            items,
            totalCount: Infinity
        });
    } else {
        const { discography, relatedContent } = await fetchArtistOverview(uri);
        CONFIG.artistLikedTracks && allTracks.push(...(await fetchArtistLikedTracks(uri)).map(parseArtistLikedTrack));
        CONFIG.artistTopTracks && allTracks.push(...discography.topTracks.items.map(parseTopTrackFromArtist));
        CONFIG.artistPopularReleases && itemsWithCountAr.push(discography.popularReleasesAlbums);
        CONFIG.artistSingles && itemsReleasesAr.push(discography.singles);
        CONFIG.artistAlbums && itemsReleasesAr.push(discography.albums);
        CONFIG.artistCompilations && itemsReleasesAr.push(discography.compilations);
        CONFIG.artistAppearsOn && appearsOnAr.push(relatedContent.appearsOn);
    }
    const items1 = itemsWithCountAr.flatMap((iwc)=>iwc.items);
    const items2 = itemsReleasesAr.flatMap((ir)=>ir.items.flatMap((i)=>i.releases.items));
    const albumLikeUris = items1.concat(items2).map((item)=>item.uri);
    const albumsTracks = await Promise.all(albumLikeUris.map(getTracksFromAlbum));
    const appearsOnUris = appearsOnAr.flatMap((ir)=>ir.items.flatMap((i)=>i.releases.items)).map((item)=>item.uri);
    const appearsOnTracks = await Promise.all(appearsOnUris.map(getTracksFromAlbum));
    allTracks.push(...albumsTracks.flat(), ...appearsOnTracks.flat().filter((track)=>track.artistUris.includes(uri)));
    return await Promise.all(allTracks);
};
export const getTracksFromUri = _.cond([
    [
        is.Album,
        getTracksFromAlbum
    ],
    [
        is.Artist,
        getTracksFromArtist
    ],
    [
        is_LikedTracks,
        getLikedTracks
    ],
    [
        is.PlaylistV1OrV2,
        getTracksFromPlaylist
    ]
]);
