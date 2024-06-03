import { settings } from "./index.tsx";

export const CONFIG = settings
	.addInput(
		{ id: "LFMApiKey", desc: "Last.FM API Key", inputType: "text" },
		() => "********************************",
	)
	.addInput({ id: "LFMUsername", desc: "Last.FM username", inputType: "text" }, () => "Username")
	.finalize().cfg;
