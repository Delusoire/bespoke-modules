import { settings } from "./index.tsx";
import { createFolder } from "/modules/Delusoire/delulib/lib/platform.ts";

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
