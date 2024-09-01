import { IndexMixinFn } from "/hooks/module.ts";

export const mixin: IndexMixinFn = async (context) => {
	return await (await import("./mix.ts")).default(context.transformer);
};
