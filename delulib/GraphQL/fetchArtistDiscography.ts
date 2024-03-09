import { Item2, ItemsReleases } from "./sharedTypes.js";
import { S } from "/modules/Delusoire/std/index.js";

export type fetchArtistDiscographyRes = {
	__typename: "artist";
	discography: {
		all: ItemsReleases<Item2>;
	};
};
export const fetchArtistDiscography = (uri: string, offset = 0, limit = 100) => {
	const _fetchArtistDiscography = async (offset: number, limit: number) => {
		const res = await S.Platform.getGraphQLLoader()(S.GraphQLDefinitions.queryArtistDiscographyAll, {
			uri,
			offset,
			limit,
		});
		const { discography } = res.data.artistUnion as fetchArtistDiscographyRes;
		const { totalCount, items } = discography.all;

		if (offset + limit < totalCount) items.push(...(await _fetchArtistDiscography(offset + limit, limit)));

		return items;
	};

	return _fetchArtistDiscography(offset, limit);
};
