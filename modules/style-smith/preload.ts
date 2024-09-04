import { hotwired, type PreloadContext } from "/hooks/module.ts";

import { ConfigletManager } from "./src/configlet.ts";
import { PaletteManager } from "./src/palette.ts";

const { module, promise } = await hotwired<PreloadContext>(import.meta);

import { createStorage } from "/modules/stdlib/mod.ts";
export let storage = createStorage(module);

promise.wrap((async () => {
	PaletteManager.INSTANCE._init();
	ConfigletManager.INSTANCE._init();

	return () => {
		// @ts-ignore
		storage = null;
	};
})());
