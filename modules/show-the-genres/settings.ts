import { settings } from "./mod.ts";

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
