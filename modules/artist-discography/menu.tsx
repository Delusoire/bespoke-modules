import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { is } from "/modules/stdlib/src/webpack/URI.ts";
import { useMenuItem } from "/modules/stdlib/src/registers/menu.ts";
import { MenuItem } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { getTracksFromArtist } from "./fetch.ts";
import {
	createPlaylistFromTracks,
	setPlaylistVisibility,
} from "/modules/Delusoire.delulib/lib/platform.ts";
import { Snackbar } from "/modules/stdlib/src/expose/Snackbar.ts";

export const GenerateDiscographyPlaylistMenuItem = () => {
	const { props } = useMenuItem();
	const uri = props?.uri;

	if (!uri || !is.Artist(uri)) {
		return;
	}

	return (
		<MenuItem
			disabled={false}
			onClick={async () => {
				const tracks = await getTracksFromArtist(uri);

				const playlistName = `${uri} - discography`;

				const { success, uri: playlistUri } =
					await createPlaylistFromTracks(
						playlistName,
						tracks.map((t) => t.uri),
					);

				if (!success) {
					Snackbar.enqueueSnackbar(
						`Failed to create Playlist ${playlistName}`,
						{ variant: "error" },
					);
					return;
				}

				setPlaylistVisibility(playlistUri, false);
				Snackbar.enqueueSnackbar(`Playlist ${playlistName} created`, {
					variant: "default",
				});
			}}
			leadingIcon={createIconComponent({ icon: "" })}
		>
			Generate discography playlist
		</MenuItem>
	);
};
