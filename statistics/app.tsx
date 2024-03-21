import ArtistsPage from "./pages/top_artists.js";
import TracksPage from "./pages/top_tracks.js";
import GenresPage from "./pages/top_genres.js";
import LibraryPage from "./pages/library.js";
import AlbumsPage from "./pages/top_albums.js";

import { S } from "/modules/Delusoire/stdlib/index.js";

const { React } = S;

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
	const match = S.useMatch("/stats/:category");
	const selectedCategory = match?.params?.category ?? categories[0];

	const SelectedPage = Pages[selectedCategory];

	return (
		<div id="stats-app">
			<S.ReactComponents.Routes>
				<S.ReactComponents.Route path="/" element={<S.ReactComponents.InstrumentedRedirect to={`/stats/${selectedCategory}`} />} />
				<S.ReactComponents.Route
					path=":category"
					element={<selectedCategoryCtx.Provider value={selectedCategory}>{SelectedPage}</selectedCategoryCtx.Provider>}
				/>
			</S.ReactComponents.Routes>
		</div>
	);
}
