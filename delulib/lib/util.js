import { S } from "/modules/Delusoire/stdlib/index.js";
const PlayerAPI = S.Platform.getPlayerAPI();
export const SpotifyLoc = {
    before: {
        start: ()=>({
                before: "start"
            }),
        fromUri: (uri)=>({
                before: {
                    uri
                }
            }),
        fromUid: (uid)=>({
                before: {
                    uid
                }
            })
    },
    after: {
        end: ()=>({
                after: "end"
            }),
        fromUri: (uri)=>({
                after: {
                    uri
                }
            }),
        fromUid: (uid)=>({
                after: {
                    uid
                }
            })
    }
};
export const normalizeStr = (str)=>str.normalize("NFKD").replace(/\(.*\)/g, "").replace(/\[.*\]/g, "").replace(/-_,/g, " ").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").toLowerCase().trim();
export class PermanentMutationObserver extends MutationObserver {
    target = null;
    constructor(mod, targetSelector, callback, opts = {
        childList: true,
        subtree: true
    }){
        super(callback);
        const metaObserver = new MutationObserver(()=>{
            const nextTarget = document.querySelector(targetSelector);
            if (nextTarget && !nextTarget.isEqualNode(this.target)) {
                this.target && this.disconnect();
                this.target = nextTarget;
                this.observe(this.target, opts);
            }
        });
        metaObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        const unloadJS = mod.unloadJS;
        mod.unloadJS = ()=>{
            metaObserver.disconnect();
            this.disconnect();
            return unloadJS();
        };
    }
}
export const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
export const createQueueItem = (queued)=>({ uri, uid = "" })=>({
            contextTrack: {
                uri,
                uid,
                metadata: {
                    is_queued: queued.toString()
                }
            },
            removed: [],
            blocked: [],
            provider: queued ? "queue" : "context"
        });
export const setQueue = async (nextTracks, contextUri)=>{
    const { _queue, _client } = PlayerAPI._queue;
    const { prevTracks, queueRevision } = _queue;
    const res = await _client.setQueue({
        nextTracks,
        prevTracks,
        queueRevision
    });
    await PlayerAPI.skipToNext();
    if (contextUri) {
        await new Promise((resolve)=>{
            PlayerAPI.getEvents().addListener("queue_update", ()=>resolve(), {
                once: true
            });
        });
        await setPlayingContext(contextUri);
    }
    return res;
};
export const setPlayingContext = (uri)=>{
    const { sessionId } = PlayerAPI._state;
    return PlayerAPI.updateContext(sessionId, {
        uri,
        url: `context://${uri}`
    });
};
export const getSongPositionMs = (item = PlayerAPI.getState().item)=>{
    if (item === null) return null;
    const { positionAsOfTimestamp, timestamp, duration, speed, hasContext, isPaused, isBuffering } = item;
    if (!positionAsOfTimestamp || !duration) return null;
    if (!hasContext || isPaused || isBuffering) return positionAsOfTimestamp;
    const scaledTimeSinceTimestamp = (Date.now() - timestamp) * (speed ?? 0);
    return Math.min(positionAsOfTimestamp + scaledTimeSinceTimestamp, duration);
};
