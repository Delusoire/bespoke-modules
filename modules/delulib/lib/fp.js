import { _ } from "/modules/official/stdlib/deps.js";
import { Snackbar } from "/modules/official/stdlib/src/expose/Snackbar.js";
export const pMchain = (f)=>async (fa)=>f(await fa);
export const chunkifyN = (n)=>(fn)=>async (args)=>{
            const a = await Promise.all(_(args).chunk(n).map(fn).value());
            return a.flat();
        };
export const chunkify50 = chunkifyN(50);
export const chunkify20 = chunkifyN(20);
export const progressify = (f, n)=>{
    let i = n;
    let lastProgress = 0;
    return async (..._)=>{
        const res = await f(..._);
        const progress = Math.round((1 - --i / n) * 100);
        if (progress > lastProgress) {
            Snackbar.updater.enqueueSetState(Snackbar, ()=>({
                    snacks: [],
                    queue: []
                }));
            Snackbar.enqueueSnackbar(`Loading: ${progress}%`, {
                variant: "default",
                autoHideDuration: 200,
                transitionDuration: {
                    enter: 0,
                    exit: 0
                }
            });
        }
        lastProgress = progress;
        return res;
    };
};
export const zip_n_uplets = (n)=>(a)=>a.map((_, i, a)=>a.slice(i, i + n)).slice(0, 1 - n);
export const getConcurrentExecutionLimiterWrapper = (limit)=>(task)=>{
        const waitingQ = new Set();
        const executingQ = new Set();
        return async function() {
            const { promise, resolve } = Promise.withResolvers();
            if (executingQ.size >= limit) {
                waitingQ.add(resolve);
                await promise;
                waitingQ.delete(resolve);
            }
            executingQ.add(resolve);
            return await task(...arguments).finally(()=>{
                executingQ.delete(resolve);
                waitingQ.keys().next().value?.();
            });
        };
    };