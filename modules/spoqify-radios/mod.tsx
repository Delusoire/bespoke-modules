import { _ } from "/modules/official/stdlib/deps.ts";

import { createRegistrar } from "/modules/official/stdlib/mod.ts";
import { createSettings } from "/modules/official/stdlib/lib/settings.tsx";

import type { Module } from "/hooks/index.ts";
import type { Settings } from "/modules/official/stdlib/lib/settings.tsx";
import { React } from "/modules/official/stdlib/src/expose/React.ts";

export let settings: Settings;
export default async function (mod: Module) {
	const registrar = createRegistrar(mod);
	[settings] = createSettings(mod);

	const { SpoqifyRadiosButton, FolderPickerMenuItem } = await import("./spoqifyRadios.tsx");

	registrar.register("menu", <SpoqifyRadiosButton />);

	registrar.register("menu", <FolderPickerMenuItem />);
}
