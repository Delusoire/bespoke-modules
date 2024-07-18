import { useLivePlaylistItems } from "/modules/Delusoire.library-db/mod.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { useLiveQuery } from "/modules/Delusoire.dexie-react-hooks/mod.ts";
import { db } from "/modules/Delusoire.library-db/lib/db.ts";
import type { Module } from "/hooks/index.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import {
	Menu,
	MenuItem,
	RightClickMenu,
	Tooltip,
} from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { fromString } from "/modules/stdlib/src/webpack/URI.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import {
	COLUMN_KEYS_EVERYWHERE,
	CUSTOM_COLUMNS,
} from "/modules/Delusoire.tracklist-columns/mix.ts";

const History = Platform.getHistory();
const PlaylistAPI = Platform.getPlaylistAPI();

const PlaylistLabel = (
	{ uri, playlistUri }: { uri: string; playlistUri: string },
) => {
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

const PlaylistLabels = React.memo(({ uri }: { uri: string }) => {
	const playlists = useLivePlaylistItems(uri);
	return (
		<div className="playlist-labels-labels-container">
			{playlists.map((playlist) => (
				<PlaylistLabel key={playlist} uri={uri} playlistUri={playlist} />
			))}
		</div>
	);
});

const PlaylistLabelsWrapper = React.memo(({ data }: any) => {
	const uri = data.uri;
	return uri && <PlaylistLabels uri={uri} />;
});

const COLUMN = {
	key: "playlist-labels",
	label: "Playlist labels",
	render: PlaylistLabelsWrapper,
	cond: () => false,
};

CUSTOM_COLUMNS[COLUMN.key] = COLUMN;
COLUMN_KEYS_EVERYWHERE.add(COLUMN.key);
