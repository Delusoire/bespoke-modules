import { setQueue as _setQueue, createQueueItem } from "/modules/Delusoire/delulib/lib/util.js";
import { _, fp } from "/modules/official/stdlib/deps.js";
import { fillTracksFromLastFM, fillTracksFromSpotify } from "./populate.js";
import { CONFIG } from "./settings.js";
import { SEPARATOR_URI, SortAction, SortActionIcon, SortActionProp, is_LikedTracks } from "./util.js";
import { getTracksFromUri } from "./fetch.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
export * from "./playlistsInterop.js";
const PlayerAPI = Platform.getPlayerAPI();
export let lastFetchedUri;
export let lastSortAction;
globalThis.lastSortedQueue = [];
const populateTracks = _.cond([
    [
        fp.startsWith("Spotify"),
        fillTracksFromSpotify
    ],
    [
        fp.startsWith("LastFM"),
        ()=>fillTracksFromLastFM
    ]
]);
const setQueue = (tracks)=>{
    if (PlayerAPI._state.item?.uid == null) return void S.Snackbar.enqueueSnackbar("Queue is null!", {
        variant: "error"
    });
    const dedupedQueue = _.uniqBy(tracks, "uri");
    globalThis.lastSortedQueue = dedupedQueue;
    const isLikedTracks = is_LikedTracks(lastFetchedUri);
    const queue = globalThis.lastSortedQueue.concat({
        uri: SEPARATOR_URI
    }).map(createQueueItem(isLikedTracks));
    return _setQueue(queue, isLikedTracks ? undefined : lastFetchedUri);
};
// Menu
const sortTracksBy = (sortAction, sortFn, descending)=>async (uri)=>{
        lastSortAction = sortAction;
        lastFetchedUri = uri;
        const tracks = await getTracksFromUri(uri);
        let sortedTracks = await sortFn(tracks);
        if (CONFIG.preventDuplicates) {
            sortedTracks = _.uniqBy(sortedTracks, "name");
        }
        descending && sortedTracks.reverse();
        return await setQueue(sortedTracks);
    };
const GenericSortBySubMenuItem = ({ descending, sortAction })=>{
    const { props } = useMenuItem();
    const uri = props.uri;
    return /*#__PURE__*/ React.createElement(MenuItem, {
        disabled: false,
        onClick: ()=>{
            const sortActionProp = SortActionProp[sortAction];
            const sortFn = async (tracks)=>{
                const filledTracks = await populateTracks(sortAction)(tracks);
                const filteredTracks = filledTracks.filter((track)=>track[sortActionProp] != null);
                return _.sortBy(filteredTracks, sortActionProp);
            };
            sortTracksBy(sortAction, sortFn, descending)(uri);
        },
        leadingIcon: createIconComponent({
            icon: SortActionIcon[sortAction]
        })
    }, sortAction);
};
const SubMenuItems = Object.values(SortAction).map((sortAction)=>(props)=>/*#__PURE__*/ React.createElement(GenericSortBySubMenuItem, {
            ...props,
            sortAction: sortAction
        }));
import { createIconComponent } from "/modules/official/stdlib/lib/createIconComponent.js";
import { useMenuItem } from "/modules/official/stdlib/src/registers/menu.js";
import { is } from "/modules/official/stdlib/src/webpack/URI.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { MenuItem, MenuItemSubMenu } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
import { useContextMenuState } from "/modules/official/stdlib/src/webpack/CustomHooks.js";
const SortByShuffleSubMenuItem = ({ descending })=>{
    const { props } = useMenuItem();
    const uri = props.uri;
    return /*#__PURE__*/ React.createElement(MenuItem, {
        disabled: false,
        onClick: ()=>sortTracksBy("True Shuffle", _.shuffle, descending)(uri),
        leadingIcon: createIconComponent({
            icon: '<path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z"/>'
        })
    }, "True shuffle");
};
const SortByStarsSubMenuItem = ({ descending })=>{
    if (!globalThis.tracksRatings) return;
    const { props } = useMenuItem();
    const uri = props.uri;
    return /*#__PURE__*/ React.createElement(MenuItem, {
        disabled: false,
        onClick: ()=>sortTracksBy("Stars", fp.sortBy((track)=>globalThis.tracksRatings[track.uri] ?? 0), descending)(uri),
        leadingIcon: createIconComponent({
            icon: '<path fill="none" d="M0 0h16v16H0z"/><path d="M13.797 2.727a4.057 4.057 0 00-5.488-.253.558.558 0 01-.31.112.531.531 0 01-.311-.112 4.054 4.054 0 00-5.487.253c-.77.77-1.194 1.794-1.194 2.883s.424 2.113 1.168 2.855l4.462 5.223a1.791 1.791 0 002.726 0l4.435-5.195a4.052 4.052 0 001.195-2.883 4.057 4.057 0 00-1.196-2.883z"/>'
        })
    }, "Stars");
};
SubMenuItems.push(SortByShuffleSubMenuItem, SortByStarsSubMenuItem);
export const FolderPickerMenuItem = ()=>{
    const { props } = useMenuItem();
    const uri = props?.reference?.uri;
    if (!uri || !is.Folder(uri)) {
        return;
    }
    return /*#__PURE__*/ React.createElement(MenuItem, {
        disabled: false,
        onClick: ()=>{
            CONFIG.sortedPlaylistsFolderUri = uri;
        },
        leadingIcon: createIconComponent({
            icon: '<path d="M1.75 1A1.75 1.75 0 000 2.75v11.5C0 15.216.784 16 1.75 16h12.5A1.75 1.75 0 0016 14.25v-9.5A1.75 1.75 0 0014.25 3H7.82l-.65-1.125A1.75 1.75 0 005.655 1H1.75zM1.5 2.75a.25.25 0 01.25-.25h3.905a.25.25 0 01.216.125L6.954 4.5h7.296a.25.25 0 01.25.25v9.5a.25.25 0 01-.25.25H1.75a.25.25 0 01-.25-.25V2.75z"/>'
        })
    }, "Choose for Sorted Playlists");
};
export const SortBySubMenu = ()=>{
    const { modifierKeyHeld } = useContextMenuState();
    const descending = modifierKeyHeld ^ Number(CONFIG.descending);
    const leadingIcon = createIconComponent({
        icon: descending ? '<path d="M3 6l5 5.794L13 6z"/>' : '<path d="M13 10L8 4.206 3 10z"/>'
    });
    const { props } = useMenuItem();
    const uri = props?.uri;
    if (!uri || ![
        is.Album,
        is.Artist,
        is_LikedTracks,
        is.Track,
        is.PlaylistV1OrV2
    ].some((f)=>f(uri))) {
        return;
    }
    return /*#__PURE__*/ React.createElement(MenuItemSubMenu, {
        leadingIcon: leadingIcon,
        displayText: "Sort by",
        depth: 1,
        placement: "right-start",
        disabled: false
    }, SubMenuItems.map((SubMenuItem)=>/*#__PURE__*/ React.createElement(SubMenuItem, {
            descending: descending
        })));
};
