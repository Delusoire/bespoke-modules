import { createRegistrar } from "/modules/stdlib/mod.ts";

import type { Settings } from "/modules/stdlib/lib/settings.tsx";
import type { Module } from "/hooks/index.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

export let settings: Settings;
export default async function (mod: Module) {
	const registrar = createRegistrar(mod);

	const { PickAndShuffle } = await import("./menu.tsx");

	registrar.register("menu", <PickAndShuffle />);
}
