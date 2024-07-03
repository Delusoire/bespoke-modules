import { _ } from "/modules/official/stdlib/deps.ts";
import { fetchPlaylistContents, fetchRootFolder } from "/modules/Delusoire/delulib/lib/platform.ts";

import type { LikedPlaylist, PersonalFolder, PersonalPlaylist, PoF } from "./util.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";

const LibraryAPI = Platform.getLibraryAPI();
const LocalStorageAPI = Platform.getLocalStorageAPI();

export type LibraryBackup = Record<string, Array<string>> & {
	rootlist: PersonalFolder;
};

export type LocalStorageBackup = {
	localStore: Array<[string, string]>;
	localStoreAPI: Array<[string, string]>;
};

type Prefs = Record<
	string,
	{
		number?: number;
		bool?: boolean;
		string?: string;
	}
>;
type ProductState = Record<string, string>;

export type SettingBackup = {
	prefs: Prefs;
	productState: ProductState;
};

export const getLibrary = async () => {
	const { items } = await LibraryAPI.getContents({ limit: 50000, sortOrder: 1 });
	const lib = {} as Record<string, Array<string>>;
	for (const item of items) {
		lib[item.type] ??= [];
		lib[item.type].push(item.uri);
	}
	const extractUris = ({ items }) => items.map((item) => item.uri);
	const track = await LibraryAPI.getTracks({ limit: 50000, sort: { field: "ADDED_AT", order: "ASC" } }).then(
		extractUris,
	);
	const episode = await LibraryAPI.getEpisodes({ limit: 50000, sort: { field: "ADDED_AT", order: "ASC" } })
		.then(extractUris);
	// const book =
	const rootlist = await fetchRootFolder().then(extractLikedPlaylistTreeRecur);
	return Object.assign(
		{
			track,
			episode,
			rootlist,
		},
		_.omit(lib, ["playlist", "folder"]),
	) as LibraryBackup;
};

const PrefsAPI = Platform.getSettingsAPI().quality.volumeLevel.prefsApi;
const ProductStateAPI = Platform.getProductStateAPI();

BigInt.prototype.toJSON = function () {
	return `${this.toString()}n`;
};

export const getSettings = async () => {
	const { entries } = await PrefsAPI.getAll();
	const pairs = await ProductStateAPI.getValues();
	const prefs = entries as Prefs;
	const productState = _.pick(pairs, [
		"autoplay",
		"dsa-mode-available",
		"dsa-mode-enabled",
		"enable-annotations",
		"enable-annotations-read",
		"enable-autostart",
		"enable-crossfade",
		"enable-gapless",
		"explicit-content",
		"filter-explicit-content",
		"public-toplist",
		"publish-activity",
		"publish-playlist",
	]) as ProductState;

	return {
		prefs,
		productState,
	} as SettingBackup;
};

export const getLocalStorage = () =>
	Object.entries(localStorage).filter(([key]) => key.match(/(settings|module):/));

export const getLocalStoreAPI = () => {
	return Object.entries(LocalStorageAPI.items)
		.filter(([key]) => key.startsWith(LocalStorageAPI.namespace))
		.map(([key, value]) => [key.split(":")[1], value] as const);
};

export const extractLikedPlaylistTreeRecur = async (
	leaf: PoF,
): Promise<PersonalFolder | PersonalPlaylist | LikedPlaylist> => {
	switch (leaf.type) {
		case "playlist": {
			const getPlaylistContents = (uri: string) =>
				fetchPlaylistContents(uri).then((tracks) => tracks.map((track) => track.uri));

			return {
				[leaf.name]: leaf.isOwnedBySelf ? await getPlaylistContents(leaf.uri) : leaf.uri,
			} as PersonalPlaylist | LikedPlaylist;
		}
		case "folder": {
			const a = leaf.items.map(extractLikedPlaylistTreeRecur);
			return {
				[leaf.name]: await Promise.all(a),
			};
		}
	}
};
