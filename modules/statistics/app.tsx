import ArtistsPage from "./pages/top_artists.tsx";
import TracksPage from "./pages/top_tracks.tsx";
import GenresPage from "./pages/top_genres.tsx";
import LibraryPage from "./pages/library.tsx";
import AlbumsPage from "./pages/top_albums.tsx";

import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { InstrumentedRedirect, Route, Routes } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { useMatch } from "/modules/official/stdlib/src/webpack/ReactRouter.xpui.ts";

const Pages = {
	tracks: <TracksPage />,
	artists: <ArtistsPage />,
	albums: <AlbumsPage />,
	genres: <GenresPage />,
	library: <LibraryPage />,
};

export const categories = Object.keys(Pages) as Array<keyof typeof Pages>;

export const selectedCategoryCtx = React.createContext<string>(null);

export default function () {
	const match = useMatch("/bespoke/stats/:category");
	const selectedCategory = match?.params?.category ?? categories[0];

	const SelectedPage = Pages[selectedCategory];

	return (
		<div id="stats-app">
			<Routes>
				<Route
					path="/"
					element={<InstrumentedRedirect to={`/bespoke/stats/${selectedCategory}`} />}
				/>
				<Route
					path=":category"
					element={
						<selectedCategoryCtx.Provider value={selectedCategory}>
							{SelectedPage}
						</selectedCategoryCtx.Provider>
					}
				/>
			</Routes>
		</div>
	);
}
