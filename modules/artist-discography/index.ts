import type { ModuleInstance } from "/hooks/index.ts";

export function load(mod: ModuleInstance) {
	return import("./mod.tsx").then((m) => m.default(mod));
}
