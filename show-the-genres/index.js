import { createSettings } from "/modules/official/stdlib/lib/settings.js";
import { createEventBus } from "/modules/official/stdlib/index.js";
export let settings;
export let eventBus;
export default function(mod) {
    [settings] = createSettings(mod);
    eventBus = createEventBus(mod);
    import("./showTheGenres.js");
}
