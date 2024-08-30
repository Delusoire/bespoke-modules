import { IndexLoadFn, IndexPreloadFn } from "/hooks/module.ts";

export const preload: IndexPreloadFn = async (mod) => {
	return await (await import("./palette.ts")).default(mod);
};

export const load: IndexLoadFn = async (mod) => {
	return await (await import("./mod.tsx")).default(mod);
};
