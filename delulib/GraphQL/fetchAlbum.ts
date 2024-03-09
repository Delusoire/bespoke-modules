import { S } from "/modules/Delusoire/std/index.js";
import { Items, ItemsWithCount } from "./sharedTypes.js";

export type fetchAlbumRes = {
	__typename: "album";
	uri: string;
	name: string;
	artists: {
		totalCount: number;
		items: Array<{
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
			sharingInfo: {
				shareUrl: string;
			};
		}>;
	};
	coverArt: {
		extractedColors: {
			colorRaw: {
				hex: string;
			};
			colorLight: {
				hex: string;
			};
			colorDark: {
				hex: string;
			};
		};
		sources: Array<Platform.ImageSized>;
	};
	discs: {
		totalCount: number;
		items: Array<{
			number: number;
			tracks: {
				totalCount: number;
			};
		}>;
	};
	releases: ItemsWithCount<{
		uri: string;
		name: string;
	}>;
	type: string;
	date: {
		isoString: string;
		precision: string;
	};
	playability: {
		playable: boolean;
		reason: string;
	};
	label: string;
	copyright: {
		totalCount: number;
		items: Array<{
			type: string;
			text: string;
		}>;
	};
	courtesyLine: string;
	saved: boolean;
	sharingInfo: {
		shareUrl: string;
		shareId: string;
	};
	tracks: ItemsWithCount<{
		uid: string;
		track: {
			saved: boolean;
			uri: string;
			name: string;
			playcount: string;
			discNumber: number;
			trackNumber: number;
			contentRating: {
				label: string;
			};
			relinkingInformation: any;
			duration: {
				totalMilliseconds: number;
			};
			playability: {
				playable: boolean;
			};
			artists: Items<{
				uri: string;
				profile: {
					name: string;
				};
			}>;
		};
	}>;
	moreAlbumsByArtist: Items<{
		discography: {
			popularReleasesAlbums: Items<{
				id: string;
				uri: string;
				name: string;
				date: {
					year: number;
				};
				coverArt: {
					sources: Array<Platform.ImageSized>;
				};
				playability: {
					playable: boolean;
					reason: string;
				};
				sharingInfo: {
					shareId: string;
					shareUrl: string;
				};
				type: string;
			}>;
		};
	}>;
};
const queue = new Array<() => void>();
export const fetchAlbum = async (uri: string, offset = 0, limit = 415) => {
	let resolveOwn: undefined | (() => void);
	await new Promise<void>(resolve => {
		queue.push((resolveOwn = resolve));
		if (queue.length < 1000) {
			resolve();
		}
	});

	const res = await S.Platform.getGraphQLLoader()(S.GraphQLDefinitions.getAlbum, {
		uri,
		locale: S.Locale.getLocaleForURLPath(),
		offset,
		limit,
	});

	const index = queue.findIndex(r => r === resolveOwn);
	if (index != -1) {
		queue.splice(index, 1);
	}
	queue[0]?.();

	return res.data.albumUnion as fetchAlbumRes;
};
