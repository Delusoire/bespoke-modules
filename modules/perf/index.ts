import type { Transformer } from "/hooks/index.ts";

export async function loadMixins(tr: Transformer) {
   return await (await import("./mix.ts")).default(tr);
}
