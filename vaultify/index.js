import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";
export let settings;
export default async function (mod) {
	[settings] = createSettings(mod);
	await import("./settings.js");
}
