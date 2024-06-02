import { settings } from "./index.ts";

import { RestoreScope, backup, restoreFactory } from "./vaultify.ts";

export const CONFIG = settings
	.addButton({
		id: "backup",
		desc: "Backup Library, LocalStorage and Settings",
		text: "Backup to clipboard",
		onClick: backup,
	})
	.addButton({
		id: "restoreLibrary",
		desc: "Restore Library",
		text: "Restore from clipboard",
		onClick: restoreFactory(RestoreScope.LIBRARY),
	})
	.addButton({
		id: "restoreLocalStorage",
		desc: "Restore LocalStorage",
		text: "Restore from clipboard",
		onClick: restoreFactory(RestoreScope.LOCALSTORAGE),
	})
	.addButton({
		id: "restoreSettings",
		desc: "Restore Settings",
		text: "Restore from clipboard",
		onClick: restoreFactory(RestoreScope.SETTINGS),
	})
	.finalize().cfg;
