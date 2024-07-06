import { GraphQLDefs } from "/modules/stdlib/src/expose/GraphQL.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";

type TrackResponseWrapper = {
	__typename: "TrackResponseWrapper";
	data: any;
};

type searchModalResultsRes = Array<{
	matchedFields: string[];
	item: TrackResponseWrapper;
}>;

export const searchModalResults = async (q: string, offset = 0, limit = 50, topResultsNum = 20, includeAudiobooks = true) => {
	const res = await Platform.getGraphQLLoader()(GraphQLDefs.query.searchModalResults, {
		searchTerm: q,
		offset,
		limit,
		numberOfTopResults: topResultsNum,
		includeAudiobooks,
	});

	return res.data.searchV2.topResults.itemsV2 as searchModalResultsRes;
};
