import { settings } from "../mod.tsx";

export const CONFIG = settings.addToggle({ id: "showLibs", desc: "Show Libraries" }, () => false).finalize().cfg;
