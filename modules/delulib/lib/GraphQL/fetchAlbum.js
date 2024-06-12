import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.js";
import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
import { getConcurrentExecutionLimiterWrapper } from "/modules/Delusoire/delulib/lib/fp.js";
export const fetchAlbum = getConcurrentExecutionLimiterWrapper(1000)(async (uri, offset = 0, limit = 415)=>{
    const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.getAlbum, {
        uri,
        locale: Locale.getLocaleForURLPath(),
        offset,
        limit
    });
    return res.data.albumUnion;
});
