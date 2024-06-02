import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.ts";

export const fetchArtistRelated = async (uri: string) => {
	const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.queryArtistRelated, {
		uri,
		locale: Locale.getLocaleForURLPath(),
	});

	return res.data.artistUnion.relatedContent.relatedArtists.items as any;
};
