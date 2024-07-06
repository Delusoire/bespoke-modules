import { is } from "/modules/stdlib/src/webpack/URI.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { useMenuItem } from "/modules/stdlib/src/registers/menu.ts";
import { MenuItem } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { showOnYouTube } from "/modules/Delusoire.search-on-youtube/util.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";

export const SearchOnYoutubeMenuItem = () => {
	const { props } = useMenuItem();
	const uri = props?.uri;

	if (!uri || !is.Track(uri)) {
		return;
	}

	return (
		<MenuItem
			disabled={false}
			onClick={() => {
				showOnYouTube(uri);
			}}
			leadingIcon={createIconComponent({
				icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="19px" height="19px"><path fill="currentColor" d="M43.2,33.9c-0.4,2.1-2.1,3.7-4.2,4c-3.3,0.5-8.8,1.1-15,1.1c-6.1,0-11.6-0.6-15-1.1c-2.1-0.3-3.8-1.9-4.2-4C4.4,31.6,4,28.2,4,24c0-4.2,0.4-7.6,0.8-9.9c0.4-2.1,2.1-3.7,4.2-4C12.3,9.6,17.8,9,24,9c6.2,0,11.6,0.6,15,1.1c2.1,0.3,3.8,1.9,4.2,4c0.4,2.3,0.9,5.7,0.9,9.9C44,28.2,43.6,31.6,43.2,33.9z"/><path fill="var(--spice-main)" d="M20 31L20 17 32 24z"/></svg>`,
			})}
		>
			Show on youtube
		</MenuItem>
	);
};
