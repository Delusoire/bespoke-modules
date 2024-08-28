import type { ModuleInstance } from "/hooks/index.ts";

export function load(mod: ModuleInstance) {
	return import("./mod.ts").then((m) => m.default(mod));
}
