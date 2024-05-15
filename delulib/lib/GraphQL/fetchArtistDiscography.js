import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
export const fetchArtistDiscography = (uri, offset = 0, limit = 100)=>{
    const _fetchArtistDiscography = async (offset, limit)=>{
        const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.queryArtistDiscographyAll, {
            uri,
            offset,
            limit
        });
        const { discography } = res.data.artistUnion;
        const { totalCount, items } = discography.all;
        if (offset + limit < totalCount) items.push(...await _fetchArtistDiscography(offset + limit, limit));
        return items;
    };
    return _fetchArtistDiscography(offset, limit);
};
