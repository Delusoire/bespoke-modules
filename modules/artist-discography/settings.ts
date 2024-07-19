import { settings } from "./mod.tsx";

export const CONFIG = settings
	.addToggle({
		id: "artistAllDiscography",
		desc: "All of the artist's Discography",
	})
	.addToggle({ id: "artistTopTracks", desc: "Top Tracks" }, () => true)
	.addToggle(
		{ id: "artistPopularReleases", desc: "Popular Releases" },
		() => true,
	)
	.addToggle({ id: "artistSingles", desc: "Singles" })
	.addToggle({ id: "artistAlbums", desc: "Albums" })
	.addToggle({ id: "artistCompilations", desc: "Compilations" })
	.addToggle({ id: "artistLikedTracks", desc: "Liked Tracks" }, () => true)
	.addToggle({ id: "artistAppearsOn", desc: "Appears On" })
	.finalize().cfg;
