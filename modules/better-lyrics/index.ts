import type { Module, Transformer } from "/hooks/index.ts";

export async function mixin(tr: Transformer) {
	return await (await import("./mix.ts")).default(tr);
}

export async function load(mod: Module) {
	return await (await import("./mod.tsx")).default(mod);
}
