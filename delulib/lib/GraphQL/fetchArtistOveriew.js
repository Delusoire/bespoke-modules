import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.js";
export const fetchArtistOverview = async (uri)=>{
    const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.queryArtistOverview, {
        uri,
        locale: Locale.getLocaleForURLPath(),
        includePrerelease: true
    });
    return res.data.artistUnion;
};
