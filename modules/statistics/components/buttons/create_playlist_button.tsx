import { Tooltip } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.ts";
import { Snackbar } from "/modules/official/stdlib/src/expose/Snackbar.ts";

export interface CreatePlaylistButtonProps {
	name: string;
	tracks: string[];
}

const RootlistAPI = Platform.getRootlistAPI();
const PlaylistAPI = Platform.getPlaylistAPI();

async function createPlaylist({ name, tracks }: CreatePlaylistButtonProps): Promise<void> {
	try {
		const playlistUri = await RootlistAPI.createPlaylist(name, { before: "start" });
		await PlaylistAPI.add(playlistUri, tracks, { before: "start" });
	} catch (error) {
		console.error(error);
		Snackbar.enqueueSnackbar("Failed to create playlist", { variant: "error" });
	}
}

const CreatePlaylistButton = (props: CreatePlaylistButtonProps): React.ReactElement<HTMLButtonElement> => (
	<Tooltip label={"Turn Into Playlist"} renderInline={true} placement="top">
		<UI.ButtonSecondary
			aria-label="Turn Into Playlist"
			children="Turn Into Playlist"
			semanticColor="textBase"
			buttonSize="sm"
			onClick={() => createPlaylist(props)}
			className="stats-make-playlist-button"
		/>
	</Tooltip>
);

export default CreatePlaylistButton;
