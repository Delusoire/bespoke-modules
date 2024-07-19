import { createRegistrar } from "/modules/stdlib/mod.ts";
import { createSettings } from "/modules/stdlib/lib/settings.tsx";

import type { Settings } from "/modules/stdlib/lib/settings.tsx";
import type { Module } from "/hooks/index.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

export let settings: Settings;
export default async function (mod: Module) {
	const registrar = createRegistrar(mod);
	[settings] = createSettings(mod);

	const { GenerateDiscographyPlaylistMenuItem } = await import("./menu.tsx");

	registrar.register("menu", <GenerateDiscographyPlaylistMenuItem />);
}
