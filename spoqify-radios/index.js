import { _ } from "/modules/Delusoire/stdlib/deps.js";
import { S, SVGIcons, createRegistrar } from "/modules/Delusoire/stdlib/index.js";
import { createSettings } from "/modules/Delusoire/stdlib/lib/settings.js";
import { useMenuItem } from "/modules/Delusoire/stdlib/src/registers/menu.js";
import { createIconComponent } from "/modules/Delusoire/stdlib/lib/createIconComponent.js";
const { URI } = S;
export let settings;
export default async function (mod) {
	const registrar = createRegistrar(mod);
	[settings] = createSettings(mod);
	const { createAnonRadio, FolderPickerMenuItem } = await import("./spoqifyRadios.js");
	registrar.register(
		"menu",
		S.React.createElement(() => {
			const { props } = useMenuItem();
			const uri = props.uri;
			return /*#__PURE__*/ S.React.createElement(
				S.ReactComponents.MenuItem,
				{
					disabled: false,
					onClick: () => {
						createAnonRadio(uri);
					},
					leadingIcon: createIconComponent({
						icon: SVGIcons.podcasts,
					}),
				},
				"Create anonymized radio",
			);
		}),
		({ props }) => {
			return _.overSome([URI.is.Album, URI.is.Artist, URI.is.PlaylistV1OrV2, URI.is.Track])(props?.uri);
		},
	);
	registrar.register("menu", /*#__PURE__*/ S.React.createElement(FolderPickerMenuItem, null), ({ props }) => {
		return URI.is.Folder(props?.reference?.uri);
	});
}
