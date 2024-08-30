import { IndexMixinFn } from "/hooks/module.ts";

export const mixin: IndexMixinFn = async (tr) => {
	return await (await import("./mix.ts")).default(tr);
};
