import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { Locale } from "/modules/stdlib/src/webpack/misc.ts";
import { GraphQLDefs } from "/modules/stdlib/src/expose/GraphQL.ts";
import { getConcurrentExecutionLimiterWrapper } from "/modules/Delusoire.delulib/lib/fp.ts";

export const fetchAlbumTracks = getConcurrentExecutionLimiterWrapper(1000)(
	async (uri: string, offset = 0, limit = 415, retries = 2): Promise<any> => {
		const res = await Platform.getGraphQLLoader()(
			GraphQLDefs.query.getAlbum,
			{
				uri,
				locale: Locale.getLocaleForURLPath(),
				offset,
				limit,
			},
		);

		if (!res.data) {
			if (retries > 0) {
				return await fetchAlbumTracks(uri, offset, limit, retries - 1);
			}
			return null;
		}

		return res.data.albumUnion as any;
	},
);
