import { S } from "/modules/Delusoire/stdlib/index.js";
export const searchModalResults = async (q, offset = 0, limit = 50, topResultsNum = 20, includeAudiobooks = true)=>{
    const res = await S.Platform.getGraphQLLoader()(S.GraphQLDefinitions.query.searchModalResults, {
        searchTerm: q,
        offset,
        limit,
        numberOfTopResults: topResultsNum,
        includeAudiobooks
    });
    return res.data.searchV2.topResults.itemsV2;
};
