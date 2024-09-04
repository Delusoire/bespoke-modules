import { hotwired, type PreloadContext } from "/hooks/module.ts";

const { module, promise } = await hotwired<PreloadContext>(import.meta);

import { createStorage } from "/modules/stdlib/mod.ts";
export let storage = createStorage(module);

promise.wrap((async () => {
	await import("./src/index.ts");
	return () => {
		// @ts-ignore
		storage = null;
	};
})());

// console.time("palette-manager");
