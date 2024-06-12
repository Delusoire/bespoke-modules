import { settings } from "../index.tsx";

export const CONFIG = settings.addToggle({ id: "showLibs", desc: "Show Libraries" }, () => false).finalize().cfg;
