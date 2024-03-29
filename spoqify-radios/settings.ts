import { settings } from "./index.js";
import { createFolder } from "/modules/Delusoire/delulib/lib/platform.js";
import { Settings } from "/modules/Delusoire/stdlib/lib/settings.js";

const ANONIMYZED_RADIOS_FOLDER_NAME = "🎭 Anonymized Radios";

export const CONFIG = settings
	.addInput(
		{
			id: "anonymizedRadiosFolderUri",
			desc: "Anonymized Radios folder uri",
			inputType: "text",
		},
		async () => (await createFolder(ANONIMYZED_RADIOS_FOLDER_NAME)).uri,
	)
	.finalize().cfg;
