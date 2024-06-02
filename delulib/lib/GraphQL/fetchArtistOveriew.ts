import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.ts";

export const fetchArtistOverview = async (uri: string) => {
	const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.queryArtistOverview, {
		uri,
		locale: Locale.getLocaleForURLPath(),
		includePrerelease: true,
	});

	return res.data.artistUnion as any;
};
