import { hotwired, type LoadContext } from "/hooks/module.ts";

import { createRegistrar } from "/modules/stdlib/mod.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";

const { module, promise } = await hotwired<LoadContext>(import.meta);

const { EditButton } = await import("./paletteManager.tsx");
const { createSchemer } = await import("./src/index.ts");

const registrar = createRegistrar(module);
registrar.register("topbarLeftButton", React.createElement(EditButton));
const schemer = createSchemer(module);

promise.resolve();
