import type { Items } from "./sharedTypes.js";
import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";

type Track = {
	__typename: "Track";
	uri: string;
	name: string;
	albumOfTrack: {
		coverArt: {
			extractedColors: {
				colorDark: {
					hex: string;
					isFallback: boolean;
				};
			};
			sources: Array<Platform.ImageSized>;
		};
	};
	artists: Items<{
		profile: {
			name: string;
		};
	}>;
};

type TrackResponseWrapper = {
	__typename: "TrackResponseWrapper";
	data: Track;
};

type searchModalResultsRes = Array<{
	matchedFields: string[];
	item: TrackResponseWrapper;
}>;
export const searchModalResults = async ( q: string, offset = 0, limit = 50, topResultsNum = 20, includeAudiobooks = true ) => {
	const res = await Platform.getGraphQLLoader()( GraphQLDefs.query.searchModalResults, {
		searchTerm: q,
		offset,
		limit,
		numberOfTopResults: topResultsNum,
		includeAudiobooks,
	} );

	return res.data.searchV2.topResults.itemsV2 as searchModalResultsRes;
};
