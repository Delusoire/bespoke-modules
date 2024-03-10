import ArtistsPage from "./pages/top_artists.js";
import TracksPage from "./pages/top_tracks.js";
import GenresPage from "./pages/top_genres.js";
import LibraryPage from "./pages/library.js";
import AlbumsPage from "./pages/top_albums.js";
import { S } from "/modules/Delusoire/std/index.js";
const { ReactDOM } = S;
const Pages = {
    tracks: /*#__PURE__*/ S.React.createElement(TracksPage, null),
    artists: /*#__PURE__*/ S.React.createElement(ArtistsPage, null),
    albums: /*#__PURE__*/ S.React.createElement(AlbumsPage, null),
    genres: /*#__PURE__*/ S.React.createElement(GenresPage, null),
    library: /*#__PURE__*/ S.React.createElement(LibraryPage, null)
};
const NavToChip = ({ to, title, selected, onClick })=>/*#__PURE__*/ S.React.createElement(S.ReactComponents.NavTo, {
        replace: true,
        to: to,
        tabIndex: -1,
        onClick: onClick,
        className: "ZWI7JsjzJaR_G8Hy4W6J"
    }, /*#__PURE__*/ S.React.createElement(S.ReactComponents.Chip, {
        selected: selected,
        selectedColorSet: "invertedLight",
        tabIndex: -1
    }, title));
const NavBar = ({ categories, selectedCategory })=>/*#__PURE__*/ S.React.createElement("div", {
        className: "fVB_YDdnaDlztX7CcWTA"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "e179_Eg8r7Ub6yjjxctr contentSpacing"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "VIeVCUUETJyYPCDpsBif"
    }, /*#__PURE__*/ S.React.createElement(S.ReactComponents.Scrollable, null, categories.map((category)=>/*#__PURE__*/ S.React.createElement(NavToChip, {
            to: `spotify:app:stats:${category}`,
            title: category,
            selected: category === selectedCategory
        }, category))))));
const TopbarMounted = ({ children })=>{
    return ReactDOM.createPortal(/*#__PURE__*/ S.React.createElement("div", {
        className: "main-topbar-topbarContent",
        style: {
            pointerEvents: "all"
        }
    }, children), document.querySelector(".rovbQsmAS_mwvpKHaVhQ"));
};
const categories = Object.keys(Pages);
const Page = ({ selectedCategory })=>Pages[selectedCategory];
export default function() {
    const match = S.useMatch("/stats/:category");
    const selectedCategory = match?.params?.category ?? categories[0];
    return /*#__PURE__*/ S.React.createElement("div", {
        id: "stats-app"
    }, /*#__PURE__*/ S.React.createElement(TopbarMounted, null, /*#__PURE__*/ S.React.createElement(NavBar, {
        categories: categories,
        selectedCategory: selectedCategory
    })), /*#__PURE__*/ S.React.createElement(S.ReactComponents.Routes, null, /*#__PURE__*/ S.React.createElement(S.ReactComponents.Route, {
        path: "/",
        element: Pages[categories[0]]
    }), /*#__PURE__*/ S.React.createElement(S.ReactComponents.Route, {
        path: ":category",
        element: /*#__PURE__*/ S.React.createElement(Page, {
            selectedCategory: selectedCategory
        })
    })));
}
