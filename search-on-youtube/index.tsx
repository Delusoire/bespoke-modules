import { createRegistrar } from "/modules/official/stdlib/index.ts";
import { createSettings } from "/modules/official/stdlib/lib/settings.tsx";
import type { Module } from "/hooks/index.ts";
import type { Settings } from "/modules/official/stdlib/lib/settings.tsx";

import { React } from "/modules/official/stdlib/src/expose/React.ts";

export let settings: Settings;

export default async function (mod: Module) {
	const registrar = createRegistrar(mod);
	[settings] = createSettings(mod);

	const { SearchOnYoutubeMenuItem } = await import("./searchOnYoutube.tsx");

	registrar.register("menu", <SearchOnYoutubeMenuItem />);
}
