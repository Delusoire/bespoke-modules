import { settings } from "./index.tsx";
import { fetchMxMToken } from "./src/utils/LyricsProvider.ts";

export const CONFIG = settings
	.addInput(
		{
			id: "musixmatchToken",
			desc: "Token for the musixmatch API",
			inputType: "text",
		},
		async () => (await fetchMxMToken()) ?? "",
	)
	.finalize().cfg;
