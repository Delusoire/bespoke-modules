import { hotwire, IndexLoadFn } from "/hooks/module.ts";

export const preload = hotwire(import.meta, "./preload.ts", () => import("./preload.ts"));

export const load: IndexLoadFn = async (context) => {
	return await (await import("./mod.ts")).default(context.module);
};
