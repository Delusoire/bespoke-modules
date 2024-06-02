import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.ts";
import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.ts";
import { getConcurrentExecutionLimiterWrapper } from "/modules/Delusoire/delulib/lib/fp.ts";


export const fetchAlbum = getConcurrentExecutionLimiterWrapper(1000)(async (uri: string, offset = 0, limit = 415) => {
	const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.getAlbum, {
		uri,
		locale: Locale.getLocaleForURLPath(),
		offset,
		limit,
	});

	return res.data.albumUnion as any;
});
