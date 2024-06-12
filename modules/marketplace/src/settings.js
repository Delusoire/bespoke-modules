import { settings } from "../index.js";
export const CONFIG = settings.addToggle({
    id: "showLibs",
    desc: "Show Libraries"
}, ()=>false).finalize().cfg;
