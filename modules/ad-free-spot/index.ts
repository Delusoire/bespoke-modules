import type { Module } from "/hooks/index.ts";

export function load(mod: Module) {
	return import("./mod.ts").then((m) => m.default(mod));
}
