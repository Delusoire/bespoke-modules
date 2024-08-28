import type { ModuleInstance, Transformer } from "/hooks/index.ts";

export async function mixin(tr: Transformer) {
	await import("./mix.ts").then((m) => m.default(tr));
}

export async function load(mod: ModuleInstance) {
	await import("./mod.tsx").then((m) => m.default(mod));
}
