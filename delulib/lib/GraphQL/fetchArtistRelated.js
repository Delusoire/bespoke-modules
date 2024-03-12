import { S } from "/modules/Delusoire/stdlib/index.js";
export const fetchArtistRelated = async (uri)=>{
    const res = await S.Platform.getGraphQLLoader()(S.GraphQLDefinitions.queryArtistRelated, {
        uri,
        locale: S.Locale.getLocaleForURLPath()
    });
    return res.data.artistUnion.relatedContent.relatedArtists.items;
};
