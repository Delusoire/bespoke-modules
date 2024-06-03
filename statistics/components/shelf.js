import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
const Shelf = ({ title, children })=>/*#__PURE__*/ React.createElement("section", {
        className: "main-shelf-shelf Shelf"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "main-shelf-header"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "main-shelf-topRow"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "main-shelf-titleWrapper"
    }, /*#__PURE__*/ React.createElement(UI.Type, {
        as: "h2",
        variant: "canon",
        semanticColor: "textBase"
    }, title)))), /*#__PURE__*/ React.createElement("section", null, children));
export default React.memo(Shelf);
