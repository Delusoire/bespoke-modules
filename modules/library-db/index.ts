import { IndexLoadFn } from "/hooks/module.ts";

export const load: IndexLoadFn = async () => {
	return await (await import("./mod.ts")).default();
};
