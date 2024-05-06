import ArtistsPage from "./pages/top_artists.js";
import TracksPage from "./pages/top_tracks.js";
import GenresPage from "./pages/top_genres.js";
import LibraryPage from "./pages/library.js";
import AlbumsPage from "./pages/top_albums.js";
import { S } from "/modules/official/stdlib/index.js";
const { React } = S;
const Pages = {
	tracks: /*#__PURE__*/ S.React.createElement(TracksPage, null),
	artists: /*#__PURE__*/ S.React.createElement(ArtistsPage, null),
	albums: /*#__PURE__*/ S.React.createElement(AlbumsPage, null),
	genres: /*#__PURE__*/ S.React.createElement(GenresPage, null),
	library: /*#__PURE__*/ S.React.createElement(LibraryPage, null),
};
export const categories = Object.keys(Pages);
export const selectedCategoryCtx = React.createContext(null);
export default function () {
	const match = S.ReactRouter.useMatch("/bespoke/stats/:category");
	const selectedCategory = match?.params?.category ?? categories[0];
	const SelectedPage = Pages[selectedCategory];
	return /*#__PURE__*/ S.React.createElement(
		"div",
		{
			id: "stats-app",
		},
		/*#__PURE__*/ S.React.createElement(
			S.ReactComponents.Routes,
			null,
			/*#__PURE__*/ S.React.createElement(S.ReactComponents.Route, {
				path: "/",
				element: /*#__PURE__*/ S.React.createElement(S.ReactComponents.InstrumentedRedirect, {
					to: `/bespoke/stats/${selectedCategory}`,
				}),
			}),
			/*#__PURE__*/ S.React.createElement(S.ReactComponents.Route, {
				path: ":category",
				element: /*#__PURE__*/ S.React.createElement(
					selectedCategoryCtx.Provider,
					{
						value: selectedCategory,
					},
					SelectedPage,
				),
			}),
		),
	);
}
