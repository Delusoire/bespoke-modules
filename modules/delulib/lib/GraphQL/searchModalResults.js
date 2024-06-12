import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
export const searchModalResults = async (q, offset = 0, limit = 50, topResultsNum = 20, includeAudiobooks = true)=>{
    const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.searchModalResults, {
        searchTerm: q,
        offset,
        limit,
        numberOfTopResults: topResultsNum,
        includeAudiobooks
    });
    return res.data.searchV2.topResults.itemsV2;
};
