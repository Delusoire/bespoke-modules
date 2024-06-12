import { settings } from "./index.ts";

export const CONFIG = settings
	.addInput(
		{
			id: "LFMApiKey",
			desc: "Last.fm API Key",
			inputType: "text",
		},
		() => "********************************",
	)
	.finalize().cfg;
