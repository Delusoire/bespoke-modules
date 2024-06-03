import ArtistsPage from "./pages/top_artists.js";
import TracksPage from "./pages/top_tracks.js";
import GenresPage from "./pages/top_genres.js";
import LibraryPage from "./pages/library.js";
import AlbumsPage from "./pages/top_albums.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { InstrumentedRedirect, Route, Routes } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
import { useMatch } from "/modules/official/stdlib/src/webpack/ReactRouter.js";
const Pages = {
    tracks: /*#__PURE__*/ React.createElement(TracksPage, null),
    artists: /*#__PURE__*/ React.createElement(ArtistsPage, null),
    albums: /*#__PURE__*/ React.createElement(AlbumsPage, null),
    genres: /*#__PURE__*/ React.createElement(GenresPage, null),
    library: /*#__PURE__*/ React.createElement(LibraryPage, null)
};
export const categories = Object.keys(Pages);
export const selectedCategoryCtx = React.createContext(null);
export default function() {
    const match = useMatch("/bespoke/stats/:category");
    const selectedCategory = match?.params?.category ?? categories[0];
    const SelectedPage = Pages[selectedCategory];
    return /*#__PURE__*/ React.createElement("div", {
        id: "stats-app"
    }, /*#__PURE__*/ React.createElement(Routes, null, /*#__PURE__*/ React.createElement(Route, {
        path: "/",
        element: /*#__PURE__*/ React.createElement(InstrumentedRedirect, {
            to: `/bespoke/stats/${selectedCategory}`
        })
    }), /*#__PURE__*/ React.createElement(Route, {
        path: ":category",
        element: /*#__PURE__*/ React.createElement(selectedCategoryCtx.Provider, {
            value: selectedCategory
        }, SelectedPage)
    })));
}
