export let registerTransform;
export default async function(rt) {
    registerTransform = rt;
    await import("./src/expose/index.js");
    await import("./src/registers/registers.js");
}
