import {
	addPlaylist,
	createFolder,
	createPlaylistFromTracks,
} from "/modules/Delusoire.delulib/lib/platform.ts";
import { SpotifyLoc } from "/modules/Delusoire.delulib/lib/util.ts";

import type { LibraryBackup, LocalStorageBackup, SettingBackup } from "./backup.ts";
import {
	isContentOfPersonalPlaylist,
	type LikedPlaylist,
	type PersonalFolder,
	type PersonalPlaylist,
} from "./util.ts";

import { _ } from "/modules/stdlib/deps.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { Snackbar } from "/modules/stdlib/src/expose/Snackbar.ts";

const LocalStorageAPI = Platform.getLocalStorageAPI();

export const restoreLibrary = async (library: LibraryBackup, silent = true) => {
	for await (const [k, v] of Object.entries(library)) {
		if (k === "rootlist") {
			await restoreRootlistRecur(v as PersonalFolder);
		} else {
			Platform.getLibraryAPI().add(...(v as string[]));
		}
	}

	!silent && Snackbar.enqueueSnackbar("Restored Library");
};

export const restoreLocalStorage = (vault: LocalStorageBackup, silent = true) => {
	for (const [k, v] of vault.localStore) localStorage.setItem(k, v);
	for (const [k, v] of vault.localStoreAPI) LocalStorageAPI.setItem(k, v);
	!silent && Snackbar.enqueueSnackbar("Restored LocalStorage");
};

const PrefsAPI = Platform.getSettingsAPI().quality.volumeLevel.prefsApi;
const ProductStateAPI = Platform.getProductStateAPI();

export const restoreSettings = async (data: SettingBackup, silent = true) => {
	const entries = _.mapValues(data.prefs, (value) => {
		value.number = eval(value.number);
		return value;
	});
	const pairs = data.productState;
	await PrefsAPI.set({ entries });
	await ProductStateAPI.setValues(pairs);
	!silent && Snackbar.enqueueSnackbar("Restored Settings");
};

const restoreRootlistRecur = async (leaf: PersonalFolder | PersonalPlaylist | LikedPlaylist, folder = "") =>
	await Promise.all(
		Object.keys(leaf).map(async (name) => {
			const subleaf = leaf[name];

			// isPlaylist
			if (!Array.isArray(subleaf)) return void addPlaylist(subleaf, folder);
			if (subleaf.length === 0) return;

			//isCollectionOfTracks
			if (isContentOfPersonalPlaylist(subleaf)) return void createPlaylistFromTracks(name, subleaf, folder);

			//isFolder
			const { success, uri } = await createFolder(name, SpotifyLoc.after.fromUri(folder));
			if (!success) return;

			for (const leaf of subleaf) restoreRootlistRecur(leaf, uri);
		}),
	);
