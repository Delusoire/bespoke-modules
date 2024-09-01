import { IndexLoadFn } from "/hooks/module.ts";

export const load: IndexLoadFn = async (context) => {
	return await (await import("./mod.tsx")).default(context.module);
};
