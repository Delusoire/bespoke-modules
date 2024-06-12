import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.js";
import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
import { getConcurrentExecutionLimiterWrapper } from "/modules/Delusoire/delulib/lib/fp.js";
export const fetchAlbumTracks = getConcurrentExecutionLimiterWrapper(1000)(async (uri, offset = 0, limit = 415, retries = 2)=>{
    const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.queryAlbumTracks, {
        uri,
        locale: Locale.getLocaleForURLPath(),
        offset,
        limit
    });
    if (!res.data) {
        if (retries > 0) {
            return await fetchAlbumTracks(uri, offset, limit, retries - 1);
        }
        return null;
    }
    return res.data.albumUnion;
});
