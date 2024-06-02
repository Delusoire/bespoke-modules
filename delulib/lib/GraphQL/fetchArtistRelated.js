import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.js";
export const fetchArtistRelated = async (uri)=>{
    const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.queryArtistRelated, {
        uri,
        locale: Locale.getLocaleForURLPath()
    });
    return res.data.artistUnion.relatedContent.relatedArtists.items;
};
