import { Builder, readJSON, Transpiler } from "jsr:@delu/tailor";

import { ensureDir } from "jsr:@std/fs/ensure-dir";

import path from "node:path";
import fs from "node:fs/promises";

import { classmapInfos } from "./build-shared.ts";

for (const inputDir of Deno.args) {
   const metadata = await readJSON<any>(path.join(inputDir, "metadata.json"));

   for (const { classmap } of classmapInfos) {
      const outputDir = path.join("dist", inputDir);

      await ensureDir(outputDir);

      const transpiler = new Transpiler(classmap);
      const builder = new Builder(transpiler, { metadata, inputDir, outputDir, copyUnknown: true });

      try {
         await builder.build();
      } catch (err) {
         await fs.rm(outputDir, { recursive: true, force: true });
         console.warn(`Build for ${inputDir} failed with error: ${err}`);
      }
   }
}
