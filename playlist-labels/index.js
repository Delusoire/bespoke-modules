import { S } from "/modules/Delusoire/stdlib/index.js";
import { useLivePlaylistItems } from "/modules/Delusoire/library-db/index.js";
import { createIconComponent } from "/modules/Delusoire/stdlib/lib/createIconComponent.js";
import { useLiveQuery } from "/modules/Delusoire/dexie-react-hooks/index.js";
import { db } from "/modules/Delusoire/library-db/lib/db.js";
const { ReactDOM, URI } = S;
const PlaylistLabels = ({ uri })=>{
    const playlists = useLivePlaylistItems(uri);
    return /*#__PURE__*/ S.React.createElement("div", {
        className: "playlist-labels-labels-container"
    }, playlists.map((playlist)=>/*#__PURE__*/ S.React.createElement(PlaylistLabel, {
            uri: uri,
            playlistUri: playlist
        })));
};
const History = S.Platform.getHistory();
const PlaylistAPI = S.Platform.getPlaylistAPI();
const PlaylistLabel = ({ uri, playlistUri })=>{
    const { metadata } = useLiveQuery(async ()=>{
        const t = await db.playlists.get(playlistUri);
        return t;
    }, [
        playlistUri
    ]) ?? {};
    const name = metadata?.name ?? "Playlist";
    const image = metadata?.images[0]?.url ?? "";
    return /*#__PURE__*/ S.React.createElement(S.ReactComponents.Tooltip, {
        label: name,
        placement: "top"
    }, /*#__PURE__*/ S.React.createElement("div", null, /*#__PURE__*/ S.React.createElement(S.ReactComponents.RightClickMenu, {
        placement: "bottom-end",
        menu: /*#__PURE__*/ S.React.createElement(S.ReactComponents.Menu, null, /*#__PURE__*/ S.React.createElement(S.ReactComponents.MenuItem, {
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
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "playlist-labels-label-container",
        style: {
            cursor: "pointer"
        },
        onClick: (e)=>{
            e.stopPropagation();
            const pathname = URI.fromString(uri)?.toURLPath(true);
            pathname && History.push({
                pathname,
                search: `?uri=${uri}`
            });
        }
    }, /*#__PURE__*/ S.React.createElement("img", {
        src: image
    })))));
};
/*
import { _ } from "/hooks/deps.js";
import { onTrackListMutationListeners } from "/modules/Delusoire/delulib/lib/listeners.js";
import { db, getTracksFromURIs } from "./db.js";
import { PlaylistItems } from "./listeners.js";

const setTrackGreyed = (track: HTMLDivElement, greyed: boolean) => {
	track.style.backgroundColor = greyed ? "gray" : undefined;
	track.style.opacity = greyed ? "0.3" : "1";
};

onTrackListMutationListeners.push(async (tracklist, tracks) => {
	const uris = tracks.map(track => track.props.uri);
	const trackObjs = await getTracksFromURIs(uris);
	const isrcs = trackObjs.map(track => track?.external_ids.isrc);

	const playlistItems = Array.from(PlaylistItems.entries())
		.map(([k, v]) => v.size > 0 && k)
		.filter(Boolean);

	tracks.map(async (track, i) => {
		const uri = uris[i];
		const isrc = isrcs[i];
		if (!isrc) return;

		const urisForIsrc = await db.tracks.where("external_ids.isrc").equals(isrc).primaryKeys();
		const urisForIsrcInPlaylists = _.intersection(urisForIsrc, playlistItems);
		setTrackGreyed(track, urisForIsrcInPlaylists.length > 1 && urisForIsrcInPlaylists.includes(uri));
	});
});
*/ export let module;
export default async function(mod) {
    module = mod;
    const { onTrackListMutationListeners } = await import("./listeners.js");
    onTrackListMutationListeners.push(async (tracklist, tracks)=>{
        tracks.map(async (track, i)=>{
            if (track.querySelector(".playlist-labels-container")) return;
            const lastColumn = track.querySelector(".HcMOFLaukKJdK5LfdHh0");
            const labelContainer = document.createElement("div");
            labelContainer.classList.add("playlist-labels-container");
            const { uri } = track.props;
            ReactDOM.render(/*#__PURE__*/ S.React.createElement(PlaylistLabels, {
                uri: uri
            }), labelContainer);
            lastColumn.insertBefore(labelContainer, lastColumn.firstChild);
        });
    });
    return ()=>{
        onTrackListMutationListeners.length = 0;
    };
}
