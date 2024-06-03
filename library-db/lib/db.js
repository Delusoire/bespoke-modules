import Dexie from "https://esm.sh/dexie";
import { chunkify50 } from "/modules/Delusoire/delulib/lib/fp.js";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import { fromString } from "/modules/official/stdlib/src/webpack/URI.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
export const db = new class extends Dexie {
    tracks;
    playlists;
    constructor(){
        super("library-db");
        this.version(1).stores({
            tracks: "&uri, external_ids.isrc",
            playlists: "&metadata.uri"
        });
    }
}();
// TODO: execute this in a worker
const fetchOrPopulateDB = (table, fetcher)=>async (primaryKeys)=>{
        const objs = await table.bulkGet(primaryKeys);
        const missed = objs.reduce((missed, obj, i)=>{
            obj ?? missed.push(i);
            return missed;
        }, []);
        if (missed.length) {
            const fillers = await fetcher(missed.map((i)=>primaryKeys[i]));
            table.bulkAdd(fillers);
            missed.forEach((i, j)=>{
                objs[i] = fillers[j];
            });
        }
        return objs;
    };
export const getTracksFromURIs = fetchOrPopulateDB(db.tracks, (uris)=>{
    const ids = uris.map((uri)=>fromString(uri).id);
    return chunkify50((is)=>spotifyApi.tracks.get(is))(ids);
});
const PlaylistAPI = Platform.getPlaylistAPI();
export const getPlaylistsFromURIs = fetchOrPopulateDB(db.playlists, (uris)=>Promise.all(uris.map((uri)=>PlaylistAPI.getPlaylist(uri))));
