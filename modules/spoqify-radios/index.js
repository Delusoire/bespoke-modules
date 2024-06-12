import { createRegistrar } from "/modules/official/stdlib/index.js";
import { createSettings } from "/modules/official/stdlib/lib/settings.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
export let settings;
export default async function(mod) {
    const registrar = createRegistrar(mod);
    [settings] = createSettings(mod);
    const { SpoqifyRadiosButton, FolderPickerMenuItem } = await import("./spoqifyRadios.js");
    registrar.register("menu", /*#__PURE__*/ React.createElement(SpoqifyRadiosButton, null));
    registrar.register("menu", /*#__PURE__*/ React.createElement(FolderPickerMenuItem, null));
}
