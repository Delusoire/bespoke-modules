import { _ } from "/modules/Delusoire/stdlib/deps.js";

import { S, SVGIcons, createRegistrar } from "/modules/Delusoire/stdlib/index.js";
import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";

import { useMenuItem } from "/modules/Delusoire/stdlib/src/registers/menu.js";
import { createIconComponent } from "/modules/Delusoire/stdlib/lib/createIconComponent.js";
import type { Module } from "/hooks/module.js";
import type { Settings } from "/modules/Delusoire/stdlib/lib/settings.js";

const { URI } = S;

export let settings: Settings;
export default async function (mod: Module) {
	const registrar = createRegistrar(mod);
	[settings] = createSettings(mod);

	const { createAnonRadio, FolderPickerMenuItem } = await import("./spoqifyRadios.js");

	registrar.register(
		"menu",
		S.React.createElement(() => {
			const { props } = useMenuItem();
			const uri = props.uri;
			return (
				<S.ReactComponents.MenuItem
					disabled={false}
					onClick={() => {
						createAnonRadio(uri);
					}}
					leadingIcon={createIconComponent({
						icon: SVGIcons.podcasts,
					})}
				>
					Create anonymized radio
				</S.ReactComponents.MenuItem>
			);
		}),
		({ props }) => {
			return _.overSome([URI.is.Album, URI.is.Artist, URI.is.PlaylistV1OrV2, URI.is.Track])(props?.uri);
		},
	);

	registrar.register("menu", <FolderPickerMenuItem />, ({ props }) => {
		return URI.is.Folder(props?.reference?.uri);
	});
}
