import { GraphQLDefs } from "/modules/stdlib/src/expose/GraphQL.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { Locale } from "/modules/stdlib/src/webpack/misc.ts";

export const fetchArtistOverview = async (uri: string) => {
	const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.queryArtistOverview, {
		uri,
		locale: Locale.getLocaleForURLPath(),
		includePrerelease: true,
	});

	return res.data.artistUnion as any;
};
