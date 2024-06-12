import { _, fp } from "/modules/official/stdlib/deps.js";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import { Types, fromString } from "/modules/official/stdlib/src/webpack/URI.js";
export const SEPARATOR_URI = "spotify:separator";
export var ERROR;
(function(ERROR) {
    ERROR["LAST_SORTED_QUEUE_EMPTY"] = "Must sort to queue beforehand";
    ERROR["LAST_SORTED_QUEUE_NOT_A_PLAYLIST"] = "Last sorted queue must be a playlist";
})(ERROR || (ERROR = {}));
export var SortAction;
(function(SortAction) {
    SortAction["SPOTIFY_PLAYCOUNT"] = "Spotify - Play Count";
    SortAction["SPOTIFY_POPULARITY"] = "Spotify - Popularity";
    SortAction["SPOTIFY_RELEASEDATE"] = "Spotify - Release Date";
    SortAction["LASTFM_SCROBBLES"] = "LastFM - Scrobbles";
    SortAction["LASTFM_PERSONALSCROBBLES"] = "LastFM - My Scrobbles";
    SortAction["LASTFM_PLAYCOUNT"] = "LastFM - Play Count";
})(SortAction || (SortAction = {}));
export var SortActionIcon;
(function(SortActionIcon) {
    SortActionIcon["Spotify - Play Count"] = '<path d="M4.018 14L14.41 8 4.018 2z"/>';
    SortActionIcon["Spotify - Popularity"] = '<path d="M13.764 2.727a4.057 4.057 0 00-5.488-.253.558.558 0 01-.31.112.531.531 0 01-.311-.112 4.054 4.054 0 00-5.487.253A4.05 4.05 0 00.974 5.61c0 1.089.424 2.113 1.168 2.855l4.462 5.223a1.791 1.791 0 002.726 0l4.435-5.195A4.052 4.052 0 0014.96 5.61a4.057 4.057 0 00-1.196-2.883zm-.722 5.098L8.58 13.048c-.307.36-.921.36-1.228 0L2.864 7.797a3.072 3.072 0 01-.905-2.187c0-.826.321-1.603.905-2.187a3.091 3.091 0 012.191-.913 3.05 3.05 0 011.957.709c.041.036.408.351.954.351.531 0 .906-.31.94-.34a3.075 3.075 0 014.161.192 3.1 3.1 0 01-.025 4.403z"/>';
    SortActionIcon["Spotify - Release Date"] = '<path d="M1 3h1V2H1v1zm3-1v1h11V2H4zM1 9h1V8H1v1zm3 0h11V8H4v1zm0 6h11v-1H4v1zm-3 0h1v-1H1v1z"/>';
    SortActionIcon["LastFM - Scrobbles"] = '<path d="M12.945 1.379l-.652.763c1.577 1.462 2.57 3.544 2.57 5.858s-.994 4.396-2.57 5.858l.651.763a8.966 8.966 0 00.001-13.242zm-2.272 2.66l-.651.763a4.484 4.484 0 01-.001 6.397l.651.763c1.04-1 1.691-2.404 1.691-3.961s-.65-2.962-1.69-3.962zM0 5v6h2.804L8 14V2L2.804 5H0zm7-1.268v8.536L3.072 10H1V6h2.072L7 3.732z"/>';
    SortActionIcon["LastFM - My Scrobbles"] = '<path d="M9.692 9.133a.202.202 0 01-.1-.143.202.202 0 01.046-.169l.925-1.084a4.035 4.035 0 00.967-2.619v-.353a4.044 4.044 0 00-1.274-2.94A4.011 4.011 0 007.233.744C5.124.881 3.472 2.7 3.472 4.886v.232c0 .96.343 1.89.966 2.618l.925 1.085a.203.203 0 01.047.169.202.202 0 01-.1.143l-2.268 1.304a4.04 4.04 0 00-2.041 3.505V15h1v-1.058c0-1.088.588-2.098 1.537-2.637L5.808 10a1.205 1.205 0 00.316-1.828l-.926-1.085a3.028 3.028 0 01-.726-1.969v-.232c0-1.66 1.241-3.041 2.826-3.144a2.987 2.987 0 012.274.812c.618.579.958 1.364.958 2.21v.354c0 .722-.258 1.421-.728 1.969l-.925 1.085A1.205 1.205 0 009.194 10l.341.196c.284-.248.6-.459.954-.605l-.797-.458zM13 6.334v4.665a2.156 2.156 0 00-1.176-.351c-1.2 0-2.176.976-2.176 2.176S10.625 15 11.824 15 14 14.024 14 12.824V8.065l1.076.622.5-.866L13 6.334zM11.824 14a1.177 1.177 0 01-1.176-1.176A1.177 1.177 0 1111.824 14z"/>';
    SortActionIcon["LastFM - Play Count"] = '<path fill="none" d="M0 0h16v16H0z"/><path d="M3 7h10v1H3zM5 10h6v1H5z"/><path d="M15 3v10H1V3h14m1-1H0v12h16V2z"/>';
})(SortActionIcon || (SortActionIcon = {}));
export var SortActionProp;
(function(SortActionProp) {
    SortActionProp["Spotify - Play Count"] = "playcount";
    SortActionProp["Spotify - Popularity"] = "popularity";
    SortActionProp["Spotify - Release Date"] = "releaseDate";
    SortActionProp["LastFM - Scrobbles"] = "scrobbles";
    SortActionProp["LastFM - My Scrobbles"] = "personalScrobbles";
    SortActionProp["LastFM - Play Count"] = "lastfmPlaycount";
})(SortActionProp || (SortActionProp = {}));
export const joinByUri = (...trackss)=>_(trackss).flatten().map(fp.omitBy(_.isNil)).groupBy("uri").mapValues((sameUriTracks)=>Object.assign({}, ...sameUriTracks)).values().value();
export const is_LikedTracks = (uri)=>{
    const uriObj = fromString(uri);
    return uriObj.type === Types.COLLECTION && uriObj.category === "tracks";
};
export const getNameFromUri = async (uri)=>{
    switch(uri.type){
        case Types.ALBUM:
            {
                const album = await spotifyApi.albums.get(uri.id);
                return album.name;
            }
        case Types.ARTIST:
            {
                const artist = await spotifyApi.artists.get(uri.id);
                return artist.name;
            }
        case Types.COLLECTION:
            if (uri.category === "tracks") return "Liked Tracks";
            break;
        case Types.PLAYLIST:
        case Types.PLAYLIST_V2:
            {
                const playlist = await spotifyApi.playlists.getPlaylist(uri.id);
                return playlist.name;
            }
    }
};
