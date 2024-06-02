import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
export const searchTracks = async (q, offset = 0, limit = 50, topResultsNum = 20, includeAudiobooks = true)=>{
    const res = await Platform.getGraphQLLoader()({
        name: "searchTracks",
        operation: "query",
        "sha256Hash": "5307479c18ff24aa1bd70691fdb0e77734bede8cce3bd7d43b6ff7314f52a6b8",
        value: null
    }, {
        searchTerm: q,
        offset,
        limit,
        numberOfTopResults: topResultsNum,
        includeAudiobooks
    });
    return res.data.searchV2.tracksV2.items;
};
