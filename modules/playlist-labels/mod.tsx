import { _ } from "/modules/official/stdlib/deps.ts";
import { useLivePlaylistItems } from "/modules/Delusoire/library-db/mod.ts";
import { createIconComponent } from "/modules/official/stdlib/lib/createIconComponent.tsx";
import { useLiveQuery } from "/modules/Delusoire/dexie-react-hooks/index.ts";
import { db } from "/modules/Delusoire/library-db/lib/db.ts";
import type { Module } from "/hooks/module.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
import {
	Menu,
	MenuItem,
	RightClickMenu,
	Tooltip,
} from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { fromString } from "/modules/official/stdlib/src/webpack/URI.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.ts";
import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.ts";

const PlaylistLabels = React.memo(({ uri }: { uri: string; }) => {
	const playlists = useLivePlaylistItems(uri);
	return (
		<div className="playlist-labels-labels-container">
			{playlists.map((playlist) => <PlaylistLabel key={playlist} uri={uri} playlistUri={playlist} />)}
		</div>
	);
});

const History = Platform.getHistory();
const PlaylistAPI = Platform.getPlaylistAPI();

const PlaylistLabel = ({ uri, playlistUri }: { uri: string; playlistUri: string; }) => {
	const playlist = useLiveQuery(async () => {
		const t = await db.playlists.get(playlistUri);
		return t;
	}, [playlistUri]) ?? {};

	const name = playlist.metadata?.name ?? "Playlist";
	const imgUrl = playlist.imgDataUrl;

	return (
		<Tooltip label={name} placement="top">
			<RightClickMenu
				placement="bottom-end"
				menu={
					<Menu>
						<MenuItem
							leadingIcon={createIconComponent({
								icon:
									'<path d="M5.25 3v-.917C5.25.933 6.183 0 7.333 0h1.334c1.15 0 2.083.933 2.083 2.083V3h4.75v1.5h-.972l-1.257 9.544A2.25 2.25 0 0 1 11.041 16H4.96a2.25 2.25 0 0 1-2.23-1.956L1.472 4.5H.5V3h4.75zm1.5-.917V3h2.5v-.917a.583.583 0 0 0-.583-.583H7.333a.583.583 0 0 0-.583.583zM2.986 4.5l1.23 9.348a.75.75 0 0 0 .744.652h6.08a.75.75 0 0 0 .744-.652L13.015 4.5H2.985z"></path>',
							})}
							onClick={(e: MouseEvent) => {
								e.stopPropagation();
								PlaylistAPI.remove(playlistUri, [{ uri, uid: "" }]);
							}}
						>
							Remove from {name}
						</MenuItem>
					</Menu>
				}
			>
				<div
					className="playlist-labels-label-container"
					style={{
						cursor: "pointer",
					}}
					onClick={(e) => {
						e.stopPropagation();
						const pathname = fromString(playlistUri)?.toURLPath(true);
						pathname &&
							History.push({
								pathname,
								search: `?uri=${uri}`,
							});
					}}
				>
					{imgUrl && <img src={imgUrl} loading="eager" />}
				</div>
			</RightClickMenu>
		</Tooltip>
	);
};

export let module: Module;
export default async function (mod: Module) {
	module = mod;
}

function createContext<A>(def: A) {
	let ctx: React.Context<A> | null = null;
	return function () {
		return ctx ??= React.createContext(def);
	};
}

let ctx = createContext<any>(null);

const PlaylistLabelsWrapper = React.memo(() => {
	const data = React.useContext(ctx());
	const uri = data.uri;
	return uri && <PlaylistLabels uri={uri} />;
});

const COLUMN = "Playlist labels";

const Row = React.memo(({ data, index, renderRow }) => {
	return React.createElement(ctx().Provider, { value: data }, renderRow(data, index));
});

globalThis.__patchTracklistWrapperProps = (props) => {
	const p = Object.assign({}, props);
	p.renderRow = React.useCallback(
		(data, index) => <Row key={index} data={data} index={index} renderRow={props.renderRow} />,
		[true, props.renderRow],
	);
	return p;
};

globalThis.__patchRenderTracklistRowColumn = (column) => {
	if (column === COLUMN) {
		return <PlaylistLabelsWrapper />;
	}
	return null;
};

globalThis.__patchTracklistColumnHeaderContextMenu = (column) => {
	if (column === COLUMN) {
		return (props) => (
			<button className={classnames(MAP.tracklist.column_header, props.className)}>
				<UI.Text
					variant="bodySmall"
					className={classnames("standalone-ellipsis-one-line", props.className)}
				>
					Playlist labels
				</UI.Text>
				{props.children}
			</button>
		);
	}
	return () => undefined;
};

globalThis.__patchTracklistColumns = (columns) => {
	const i = -1;
	return React.useMemo(() => [...columns.slice(0, i), COLUMN, ...columns.slice(i)], [true, columns]);
};
