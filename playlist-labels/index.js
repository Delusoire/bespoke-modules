import { useLivePlaylistItems } from "/modules/Delusoire/library-db/index.js";
import { createIconComponent } from "/modules/official/stdlib/lib/createIconComponent.js";
import { useLiveQuery } from "/modules/Delusoire/dexie-react-hooks/index.js";
import { db } from "/modules/Delusoire/library-db/lib/db.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { Menu, MenuItem, RightClickMenu, Tooltip } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
import { fromString } from "/modules/official/stdlib/src/webpack/URI.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.js";
import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.js";
const PlaylistLabels = React.memo(({ uri })=>{
    const playlists = useLivePlaylistItems(uri);
    return /*#__PURE__*/ React.createElement("div", {
        className: "playlist-labels-labels-container"
    }, playlists.map((playlist)=>/*#__PURE__*/ React.createElement(PlaylistLabel, {
            key: playlist,
            uri: uri,
            playlistUri: playlist
        })));
});
const History = Platform.getHistory();
const PlaylistAPI = Platform.getPlaylistAPI();
const PlaylistLabel = ({ uri, playlistUri })=>{
    const playlist = useLiveQuery(async ()=>{
        const t = await db.playlists.get(playlistUri);
        return t;
    }, [
        playlistUri
    ]) ?? {};
    const name = playlist.metadata?.name ?? "Playlist";
    const imgUrl = playlist.imgDataUrl;
    return /*#__PURE__*/ React.createElement(Tooltip, {
        label: name,
        placement: "top"
    }, /*#__PURE__*/ React.createElement(RightClickMenu, {
        placement: "bottom-end",
        menu: /*#__PURE__*/ React.createElement(Menu, null, /*#__PURE__*/ React.createElement(MenuItem, {
            leadingIcon: createIconComponent({
                icon: '<path d="M5.25 3v-.917C5.25.933 6.183 0 7.333 0h1.334c1.15 0 2.083.933 2.083 2.083V3h4.75v1.5h-.972l-1.257 9.544A2.25 2.25 0 0 1 11.041 16H4.96a2.25 2.25 0 0 1-2.23-1.956L1.472 4.5H.5V3h4.75zm1.5-.917V3h2.5v-.917a.583.583 0 0 0-.583-.583H7.333a.583.583 0 0 0-.583.583zM2.986 4.5l1.23 9.348a.75.75 0 0 0 .744.652h6.08a.75.75 0 0 0 .744-.652L13.015 4.5H2.985z"></path>'
            }),
            onClick: (e)=>{
                e.stopPropagation();
                PlaylistAPI.remove(playlistUri, [
                    {
                        uri,
                        uid: ""
                    }
                ]);
            }
        }, "Remove from ", name))
    }, /*#__PURE__*/ React.createElement("div", {
        className: "playlist-labels-label-container",
        style: {
            cursor: "pointer"
        },
        onClick: (e)=>{
            e.stopPropagation();
            const pathname = fromString(playlistUri)?.toURLPath(true);
            pathname && History.push({
                pathname,
                search: `?uri=${uri}`
            });
        }
    }, imgUrl && /*#__PURE__*/ React.createElement("img", {
        src: imgUrl,
        loading: "eager"
    }))));
};
export let module;
export default async function(mod) {
    module = mod;
}
function createContext(def) {
    let ctx = null;
    return function() {
        return ctx ??= React.createContext(def);
    };
}
let ctx = createContext(null);
const PlaylistLabelsWrapper = React.memo(()=>{
    const data = React.useContext(ctx());
    const uri = data.uri;
    return uri && /*#__PURE__*/ React.createElement(PlaylistLabels, {
        uri: uri
    });
});
const COLUMN = "Playlist labels";
const Row = React.memo(({ data, index, renderRow })=>{
    return React.createElement(ctx().Provider, {
        value: data
    }, renderRow(data, index));
});
globalThis.__patchTracklistWrapperProps = (props)=>{
    const p = Object.assign({}, props);
    p.renderRow = React.useCallback((data, index)=>/*#__PURE__*/ React.createElement(Row, {
            key: index,
            data: data,
            index: index,
            renderRow: props.renderRow
        }), [
        true,
        props.renderRow
    ]);
    return p;
};
globalThis.__patchRenderTracklistRowColumn = (column)=>{
    if (column === COLUMN) {
        return /*#__PURE__*/ React.createElement(PlaylistLabelsWrapper, null);
    }
    return null;
};
globalThis.__patchTracklistColumnHeaderContextMenu = (column)=>{
    if (column === COLUMN) {
        return (props)=>/*#__PURE__*/ React.createElement("button", {
                className: classnames("rGujAXjCLKEd_N6yTwds", props.className)
            }, /*#__PURE__*/ React.createElement(UI.Text, {
                variant: "bodySmall",
                className: classnames("standalone-ellipsis-one-line", props.className)
            }, "Playlist labels"), props.children);
    }
    return ()=>undefined;
};
globalThis.__patchTracklistColumns = (columns)=>{
    const i = -1;
    return React.useMemo(()=>[
            ...columns.slice(0, i),
            COLUMN,
            ...columns.slice(i)
        ], [
        true,
        columns
    ]);
};
