import { S, createRegistrar } from "/modules/Delusoire/stdlib/index.js";
import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";
import { Button } from "/modules/Delusoire/stdlib/src/registers/topbarLeftButton.js";
import { URI_is_LikedTracks } from "./util.js";
import { SVGIcons } from "/modules/Delusoire/stdlib/index.js";
const { URI } = S;
export let settings;
export default async function(mod) {
    const registrar = createRegistrar(mod);
    [settings] = createSettings(mod);
    const { FolderPickerMenuItem, SortBySubMenu, createPlaylistFromLastSortedQueue, reordedPlaylistLikeSortedQueue } = await import("./sortPlus.js");
    registrar.register("menu", /*#__PURE__*/ S.React.createElement(FolderPickerMenuItem, null), ({ props })=>{
        return URI.is.Folder(props?.reference?.uri);
    });
    registrar.register("menu", /*#__PURE__*/ S.React.createElement(SortBySubMenu, null), ({ props })=>{
        const uri = props?.uri;
        return uri && [
            URI.is.Album,
            URI.is.Artist,
            URI_is_LikedTracks,
            URI.is.Track,
            URI.is.PlaylistV1OrV2
        ].some((f)=>f(uri));
    });
    registrar.register("topbarLeftButton", ()=>/*#__PURE__*/ S.React.createElement(Button, {
            label: "Create a Playlist from Sorted Queue",
            icon: SVGIcons.playlist,
            onClick: createPlaylistFromLastSortedQueue
        }));
    registrar.register("topbarLeftButton", ()=>/*#__PURE__*/ S.React.createElement(Button, {
            label: "Reorder Playlist from Sorted Queue",
            icon: SVGIcons.shuffle,
            onClick: reordedPlaylistLikeSortedQueue
        }));
}
