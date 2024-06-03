import { settings } from "./index.tsx";

export const CONFIG = settings
	.addInput(
		{
			id: "YouTubeApiKey",
			desc: "YouTube API Key",
			inputType: "text",
		},
		() => "***************************************",
	)
	.finalize().cfg;
