import { hotwired, type PreloadContext } from "/hooks/module.ts";

const { module, dispose } = await hotwired<PreloadContext>(import.meta);

import { createStorage } from "/modules/stdlib/mod.ts";
export let storage = createStorage(module);

dispose.resolve(() => {
	// @ts-ignore
	storage = null;
});

import("./src/index.ts");
