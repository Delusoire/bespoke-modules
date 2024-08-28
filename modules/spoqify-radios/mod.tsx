import { _ } from "/modules/stdlib/deps.ts";

import { createRegistrar } from "/modules/stdlib/mod.ts";
import { createSettings } from "/modules/stdlib/lib/settings.tsx";

import type { ModuleInstance } from "/hooks/index.ts";
import type { Settings } from "/modules/stdlib/lib/settings.tsx";
import { React } from "/modules/stdlib/src/expose/React.ts";

export let settings: Settings;
export default async function (mod: ModuleInstance) {
	const registrar = createRegistrar(mod);
	[settings] = createSettings(mod);

	const { SpoqifyRadiosButton, FolderPickerMenuItem } = await import("./spoqifyRadios.tsx");

	registrar.register("menu", <SpoqifyRadiosButton />);

	registrar.register("menu", <FolderPickerMenuItem />);
}
