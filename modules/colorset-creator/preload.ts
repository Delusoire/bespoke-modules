import { createStorage } from "/modules/stdlib/mod.ts";
import { ModuleInstance } from "/hooks/module.ts";
import { PaletteManager } from "./palette.ts";
import { ConfigletManager } from "./configlet.ts";

export let storage: Storage;
export default function (mod: ModuleInstance) {
	storage = createStorage(mod);
	PaletteManager.INSTANCE._init();
	ConfigletManager.INSTANCE._init();
}
