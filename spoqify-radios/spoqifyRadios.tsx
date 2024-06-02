import { _ } from "/modules/official/stdlib/deps.js";
import { SpotifyLoc } from "/modules/Delusoire/delulib/lib/util.js";

import { CONFIG } from "./settings.js";

import { useMenuItem } from "/modules/official/stdlib/src/registers/menu.js";
import { createIconComponent } from "/modules/official/stdlib/lib/createIconComponent.js";
import { fromString, is } from "/modules/official/stdlib/src/webpack/URI.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { MenuItem } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";

const History = Platform.getHistory();
const RootlistAPI = Platform.getRootlistAPI();

export const createAnonRadio = (uri: string) => {
	const sse = new EventSource(`https://open.spoqify.com/anonymize?url=${uri.substring(8)}`);
	sse.addEventListener("done", e => {
		sse.close();
		const anonUri = fromString(e.data);

		History.push(anonUri.toURLPath(true));
		RootlistAPI.add([anonUri.toURI()], SpotifyLoc.after.fromUri(CONFIG.anonymizedRadiosFolderUri));
	});
};

export const FolderPickerMenuItem = () => {
	const { props } = useMenuItem();
	const uri = props?.reference?.uri;

	if (!uri || !is.Folder(uri)) {
		return;
	}

	return (
		<MenuItem
			disabled={false}
			onClick={() => {
				CONFIG.anonymizedRadiosFolderUri = uri;
			}}
			leadingIcon={createIconComponent({
				icon: '<path d="M1.75 1A1.75 1.75 0 000 2.75v11.5C0 15.216.784 16 1.75 16h12.5A1.75 1.75 0 0016 14.25v-9.5A1.75 1.75 0 0014.25 3H7.82l-.65-1.125A1.75 1.75 0 005.655 1H1.75zM1.5 2.75a.25.25 0 01.25-.25h3.905a.25.25 0 01.216.125L6.954 4.5h7.296a.25.25 0 01.25.25v9.5a.25.25 0 01-.25.25H1.75a.25.25 0 01-.25-.25V2.75z"/>',
			})}
		>
			Choose for Anonymized Radios
		</MenuItem>
	);
};

export const SpoqifyRadiosButton = () => {
	const { props } = useMenuItem();
	const uri = props?.uri;

	if (!uri || ![is.Album, is.Artist, is.PlaylistV1OrV2, is.Track].some(f => f(uri))) {
		return;
	}

	return (
		<MenuItem
			disabled={false}
			onClick={() => {
				createAnonRadio(uri);
			}}
			leadingIcon={createIconComponent({
				icon: '<path d="M4.011 8.226a3.475 3.475 0 011.216-2.387c.179-.153.373-.288.578-.401l-.485-.875a4.533 4.533 0 00-.742.515 4.476 4.476 0 00-1.564 3.069 4.476 4.476 0 002.309 4.287l.483-.875a3.483 3.483 0 01-1.795-3.333zm-1.453 4.496a6.506 6.506 0 01.722-9.164c.207-.178.425-.334.647-.48l-.551-.835c-.257.169-.507.35-.746.554A7.449 7.449 0 00.024 7.912a7.458 7.458 0 003.351 6.848l.55-.835a6.553 6.553 0 01-1.367-1.203zm10.645-9.093a7.48 7.48 0 00-1.578-1.388l-.551.835c.518.342.978.746 1.368 1.203a6.452 6.452 0 011.537 4.731 6.455 6.455 0 01-2.906 4.914l.55.835c.257-.169.507-.351.747-.555a7.453 7.453 0 002.606-5.115 7.447 7.447 0 00-1.773-5.46zm-2.281 1.948a4.497 4.497 0 00-1.245-1.011l-.483.875a3.476 3.476 0 011.796 3.334 3.472 3.472 0 01-1.217 2.387 3.478 3.478 0 01-.577.401l.485.875a4.57 4.57 0 00.742-.515 4.476 4.476 0 001.564-3.069 4.482 4.482 0 00-1.065-3.277zM7.5 7A1.495 1.495 0 007 9.908V16h1V9.908A1.495 1.495 0 007.5 7z"/><path fill="none" d="M16 0v16H0V0z"/><path fill="none" d="M16 0v16H0V0z"/>',
			})}
		>
			Create anonymized radio
		</MenuItem>
	);
};
