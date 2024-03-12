import { createRegistrar } from "/modules/Delusoire/stdlib/index.js";
import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
const { URI } = S;
export let settings;
export default async function(mod) {
    const registrar = createRegistrar(mod);
    [settings] = createSettings(mod);
    const { FolderPickerMenuItem } = await import("./starRatings.js");
    registrar.register("menu", /*#__PURE__*/ S.React.createElement(FolderPickerMenuItem, null), ({ props })=>{
        return URI.is.Folder(props?.reference?.uri);
    });
}
