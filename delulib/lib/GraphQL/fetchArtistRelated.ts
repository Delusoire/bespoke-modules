import { GraphQLDefs } from "/modules/official/stdlib/src/expose/GraphQL.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { Locale } from "/modules/official/stdlib/src/webpack/misc.js";

type fetchArtistRelatedRes = Array<{
	id: string;
	uri: string;
	profile: {
		name: string;
	};
	visuals: {
		avatarImage: {
			sources: Array<Platform.ImageSized>;
		};
	};
}>;
export const fetchArtistRelated = async ( uri: string ) => {
	const res = await Platform.getGraphQLLoader()( GraphQLDefs.queryArtistRelated, {
		uri,
		locale: Locale.getLocaleForURLPath(),
	} );

	return res.data.artistUnion.relatedContent.relatedArtists.items as fetchArtistRelatedRes;
};
