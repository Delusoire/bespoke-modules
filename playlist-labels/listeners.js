import { PermanentMutationObserver } from "/modules/Delusoire/delulib/lib/util.js";
import { REACT_FIBER } from "/modules/Delusoire/stdlib/lib/util.js";
export const getTrackLists = ()=>Array.from(document.querySelectorAll(".ShMHCGsT93epRGdxJp2w.Ss6hr6HYpN4wjHJ9GHmi"));
export const getTrackListTracks = (trackList)=>Array.from(trackList.querySelectorAll(".h4HgbO_Uu1JYg5UGANeQ"));
const PRESENTATION_KEY = Symbol("presentation");
// TODO: use a Subject & handle module lifecycles correctly
export const onTrackListMutationListeners = new Array();
const _onTrackListMutation = (trackList, record, observer)=>{
    const tracks = getTrackListTracks(trackList[PRESENTATION_KEY]);
    const recUp = (fiber)=>{
        const parent = fiber.return;
        if (parent.pendingProps.role === "presentation") return fiber;
        return recUp(parent);
    };
    for (const track of tracks){
        track.props ??= recUp(track[REACT_FIBER]).pendingProps;
    }
    const fullyRenderedTracks = tracks.filter((track)=>track.props?.uri);
    onTrackListMutationListeners.map((listener)=>listener(trackList, fullyRenderedTracks));
};
new PermanentMutationObserver("main", ()=>{
    const trackLists = getTrackLists();
    for (const trackList of trackLists.filter((trackList)=>!trackList[PRESENTATION_KEY])){
        trackList[PRESENTATION_KEY] = trackList.lastElementChild.firstElementChild.nextElementSibling;
        new MutationObserver((record, observer)=>_onTrackListMutation(trackList, record, observer)).observe(trackList[PRESENTATION_KEY], {
            childList: true
        });
    }
});
