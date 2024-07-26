import { React } from "/modules/stdlib/src/expose/React.ts";
import { useMenuItem } from "/modules/stdlib/src/registers/menu.ts";
import { MenuItem } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { _ } from "/modules/stdlib/deps.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";

export const PickAndShuffle = () => {
	const { props } = useMenuItem();
	const uris = props?.uris;

	if ((uris?.length ?? 0) < 3) {
		return;
	}

	return (
		<MenuItem
			leadingIcon={createIconComponent({
				icon:
					'<path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z"/>',
			})}
			onClick={async () => {
				const shuffledUris = _.shuffle(uris);
				const queue = shuffledUris.map((uri) => ({ uri, uid: null }));
				await Platform.getPlayerAPI().addToQueue(queue);
			}}
		>
			Pick and shuffle
		</MenuItem>
	);
};
