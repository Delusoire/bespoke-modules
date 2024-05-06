import { getLibrary, getLocalStorage, getLocalStoreAPI, getSettings } from "./backup.js";
import { restoreLocalStorage, restoreLibrary, restoreSettings } from "./restore.js";
import { S } from "/modules/official/stdlib/index.js";
const ClipboardAPI = S.Platform.getClipboardAPI();
export const backup = async (silent = false) => {
	const library = await getLibrary();
	const settings = await getSettings();
	const localStore = getLocalStorage();
	const localStoreAPI = getLocalStoreAPI();
	await ClipboardAPI.copy(
		JSON.stringify({
			library,
			settings,
			localStore,
			localStoreAPI,
		}),
	);
	!silent && S.Snackbar.enqueueSnackbar("Backed up Playlists, Extensions and Settings");
};
export var RestoreScope;
(function (RestoreScope) {
	RestoreScope["LIBRARY"] = "library";
	RestoreScope["LOCALSTORAGE"] = "localstorage";
	RestoreScope["SETTINGS"] = "settings";
})(RestoreScope || (RestoreScope = {}));
export const restoreFactory = mode => async () => {
	const vault = JSON.parse(await ClipboardAPI.paste());
	switch (mode) {
		case "library":
			return restoreLibrary(vault.library, true);
		case "settings":
			return restoreSettings(vault.settings, true);
		case "localstorage":
			return restoreLocalStorage(vault, true);
	}
};
