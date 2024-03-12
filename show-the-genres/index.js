import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";
export let settings;
export default function (mod) {
	[settings] = createSettings(mod);
	import("./showTheGenres.js");
}
