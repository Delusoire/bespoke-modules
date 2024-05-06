import { S } from "/modules/official/stdlib/index.js";
export const fetchArtistOverview = async uri => {
	const res = await S.Platform.getGraphQLLoader()(S.GraphQLDefinitions.query.queryArtistOverview, {
		uri,
		locale: S.Locale.getLocaleForURLPath(),
		includePrerelease: true,
	});
	return res.data.artistUnion;
};
