import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";
import { createEventBus } from "/modules/Delusoire/stdlib/index.js";
export let settings;
export let eventBus;
export default function(mod) {
    [settings] = createSettings(mod);
    eventBus = createEventBus(mod);
    import("./showTheGenres.js");
}
