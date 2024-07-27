import { settings } from "./mod.tsx";

export const CONFIG = settings
	.addToggle({ id: "enablePlaycount", desc: "Enable Playcount" }, () => false)
	.addToggle({ id: "enableReleaseDate", desc: "Enable Release Date" }, () => false)
	.addToggle({ id: "enablePopularity", desc: "Enable Popularity" }, () => false)
	.addToggle({ id: "enableScrobbles", desc: "Enable Scrobbles" }, () => false)
	.addInput({ id: "lastFmUsername", desc: "Last.fm Username", inputType: "text" }, () => "Username")
	.addInput(
		{ id: "LFMApiKey", desc: "Last.fm API Key", inputType: "text" },
		() => "********************************",
	)
	.finalize().cfg;
