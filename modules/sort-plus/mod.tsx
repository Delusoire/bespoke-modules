import { createRegistrar } from "/modules/stdlib/mod.ts";
import { createSettings } from "/modules/stdlib/lib/settings.tsx";

import { TopbarLeftButton } from "/modules/stdlib/src/registers/topbarLeftButton.tsx";

import type { Settings } from "/modules/stdlib/lib/settings.tsx";
import type { Module } from "/hooks/index.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

export let settings: Settings;
export default async function (mod: Module) {
	const registrar = createRegistrar(mod);
	[settings] = createSettings(mod);

	const {
		FolderPickerMenuItem,
		SortBySubMenu,
		createPlaylistFromLastSortedQueue,
		reordedPlaylistLikeSortedQueue,
	} = await import("./sortPlus.tsx");

	registrar.register("menu", <FolderPickerMenuItem />);

	registrar.register("menu", <SortBySubMenu />);
	registrar.register(
		"topbarLeftButton",
		<TopbarLeftButton
			label="Create a Playlist from Sorted Queue"
			icon='<path d="M15 14.5H5V13h10v1.5zm0-5.75H5v-1.5h10v1.5zM15 3H5V1.5h10V3zM3 3H1V1.5h2V3zm0 11.5H1V13h2v1.5zm0-5.75H1v-1.5h2v1.5z"/>'
			onClick={createPlaylistFromLastSortedQueue}
		/>,
	);
	registrar.register(
		"topbarLeftButton",
		<TopbarLeftButton
			label="Reorder Playlist from Sorted Queue"
			icon='<path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z"/>'
			onClick={reordedPlaylistLikeSortedQueue}
		/>,
	);
}
