import { ModuleInstance } from "/hooks/module.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { createSettings, type Settings } from "/modules/stdlib/lib/settings.tsx";

const PlaylistAPI = Platform.getPlaylistAPI();

const DEFAULT_SORT_FIELDS = new Set([
	"TITLE",
	"ADDED_AT",
	"ADDED_BY",
	"ALBUM",
	"ARTIST",
	"DURATION",
	"SHOW_NAME",
	"PUBLISH_DATE",
]);

export let settings: Settings;
export default async function (mod: ModuleInstance) {
	[settings] = createSettings(mod);

	const { load, unload } = await import("./columns.ts");
	const { patchPlaylistContents } = await import("./patchPlaylistApi.ts");

	load();

	const getPlaylist = PlaylistAPI.getPlaylist;
	PlaylistAPI.getPlaylist = async function (uri: string, _: any, opts: any, bypass = false) {
		if (bypass) {
			return await getPlaylist.call(PlaylistAPI, uri, _, opts);
		}

		const _opts = {
			...opts,
			offset: 0,
			limit: 1e9,
		};
		if (!DEFAULT_SORT_FIELDS.has(_opts?.sort?.field)) {
			_opts.sort = undefined;
		}
		const playlist = await getPlaylist.call(PlaylistAPI, uri, _, _opts);

		await patchPlaylistContents(playlist.contents, opts);

		return playlist;
	};

	const getContents = PlaylistAPI.getContents;
	PlaylistAPI.getContents = async function (uri: string, opts: any, bypass = false) {
		if (bypass) {
			return await getContents.call(PlaylistAPI, uri, opts);
		}

		const _opts = {
			...opts,
			offset: 0,
			limit: 1e9,
		};
		if (!DEFAULT_SORT_FIELDS.has(_opts?.sort?.field)) {
			_opts.sort = undefined;
		}
		const contents = await getContents.call(PlaylistAPI, uri, _opts);

		await patchPlaylistContents(contents, opts);

		return contents;
	};

	return () => {
		PlaylistAPI.getPlaylist = getPlaylist;
		PlaylistAPI.getContents = getContents;
		unload();
	};
}
