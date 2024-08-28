import type { ModuleInstance } from "/hooks/index.ts";

export async function load(mod: ModuleInstance) {
	return await (await import("./mod.ts")).default(mod);
}
