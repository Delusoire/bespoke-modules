import { IndexLoadFn,  } from "/hooks/module.ts";

export const load: IndexLoadFn = async (mod) => {
	return await (await import("./mod.tsx")).default(mod);
};
