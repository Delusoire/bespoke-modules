import { createSettings } from "/modules/official/stdlib/lib/settings.js";
export let settings;
export default async function (mod) {
	[settings] = createSettings(mod);
	await import("./settings.js");
}
