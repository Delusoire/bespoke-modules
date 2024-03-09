import { Items } from "./sharedTypes.js";
import { searchTracksDefinition } from "./Definitions/searchTracks.js";
import { S } from "/modules/Delusoire/std/index.js";

type Track = {
	__typename: "Track";
	uri: string;
	name: string;
	albumOfTrack: {
		uri: string;
		name: string;
		coverArt: {
			extractedColors: {
				colorDark: {
					hex: string;
					isFallback: boolean;
				};
			};
			sources: Array<Platform.ImageSized>;
		};
		id: string;
	};
	artists: Items<{
		uri: string;
		profile: {
			name: string;
		};
	}>;
	contentRating: {
		label: "NONE" | string;
	};
	duration: {
		totalMilliseconds: number;
	};
	playability: {
		playable: boolean;
	};
	associations: any;
};

type TrackResponseWrapper = {
	data: Track;
};

type searchModalResultsRes = Array<{
	matchedFields: string[];
	item: TrackResponseWrapper;
}>;
export const searchTracks = async (q: string, offset = 0, limit = 50, topResultsNum = 20, includeAudiobooks = true) => {
	const res = await S.Platform.getGraphQLLoader()(searchTracksDefinition, {
		searchTerm: q,
		offset,
		limit,
		numberOfTopResults: topResultsNum,
		includeAudiobooks,
	});

	return res.data.searchV2.tracksV2.items as searchModalResultsRes;
};
