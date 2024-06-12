import { Builder, readJSON, Transpiler } from "jsr:@delu/tailor";

import path from "node:path";
import fs from "node:fs/promises";


const classmapInfos = [
   {
      classmap: await readJSON("classmap.json"),
      version: "1.2.38",
      timestamp: 1675203200,
   },
];

for (const modulePath of Deno.args) {
   const metadata = await readJSON<any>(path.join(modulePath, "metadata.json"));

   for (const { classmap, version: spVersion, timestamp: cmTimestamp } of classmapInfos) {
      const m = { ...metadata };
      m.version = `${metadata.version}+sp-${spVersion}-cm-${cmTimestamp}`;
      const fingerprint = `${m.authors[0]}.${m.name}@v${m.version}`;
      const outDir = path.join(modulePath, "dist", fingerprint);

      const transpiler = new Transpiler(classmap);
      const builder = new Builder(transpiler, { metadata, outDir, copyUnknown: true });

      try {
         await builder.build(modulePath);
         await fs.writeFile(path.join(outDir, "metadata.json"), JSON.stringify(m));
      } catch (err) {
         await fs.rm(outDir, { recursive: true, force: true });
         console.warn(`Build for ${fingerprint} failed with error: ${err}`);
      }
   }
}
