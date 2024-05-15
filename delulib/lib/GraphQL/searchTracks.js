import { searchTracksDefinition } from "./Definitions/searchTracks.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
export const searchTracks = async (q, offset = 0, limit = 50, topResultsNum = 20, includeAudiobooks = true)=>{
    const res = await Platform.getGraphQLLoader()(searchTracksDefinition, {
        searchTerm: q,
        offset,
        limit,
        numberOfTopResults: topResultsNum,
        includeAudiobooks
    });
    return res.data.searchV2.tracksV2.items;
};
