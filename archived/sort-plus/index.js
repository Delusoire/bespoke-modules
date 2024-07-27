export async function load(mod) {
    return await (await import("./mod.js")).default(mod);
}
