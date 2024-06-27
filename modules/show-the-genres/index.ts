import type { Module } from "/hooks/index.ts";

export async function load(mod: Module) {
   return await (await import("./mod.ts")).default(mod);
}
