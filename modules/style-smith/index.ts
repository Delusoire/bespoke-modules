import { hotwire, type IndexLoadFn, type IndexPreloadFn } from "/hooks/module.ts";

export const preload: IndexPreloadFn = hotwire(import.meta, "./preload.ts", async () => {
	console.time("style-smith#import-preload");
	await import("./preload.ts");
	console.timeEnd("style-smith#import-preload");
});

export const load: IndexLoadFn = hotwire(import.meta, "./mod.ts", () => import("./mod.ts"));
