import { settings } from "./index.js";
import { fetchMxMToken } from "./src/utils/LyricsProvider.js";
export const CONFIG = settings.addInput({
    id: "musixmatchToken",
    desc: "Token for the musixmatch API",
    inputType: "text"
}, async ()=>await fetchMxMToken() ?? "").finalize().cfg;
