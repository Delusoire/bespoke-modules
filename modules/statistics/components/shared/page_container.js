import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.js";
import { categories, selectedCategoryCtx } from "../../app.js";
import { TopNavBar } from "/modules/official/stdlib/lib/components/MountedNavBar.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
const PageContainer = ({ title, headerLeft, headerRight, children })=>{
    const selectedCategory = React.useContext(selectedCategoryCtx);
    return /*#__PURE__*/ React.createElement("section", {
        className: "contentSpacing"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "page-header"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "header-left"
    }, /*#__PURE__*/ React.createElement(UI.Type, {
        as: "h1",
        variant: "canon",
        semanticColor: "textBase"
    }, title), headerLeft, /*#__PURE__*/ React.createElement(TopNavBar, {
        categories: categories,
        selectedCategory: selectedCategory,
        namespace: "stats"
    })), /*#__PURE__*/ React.createElement("div", {
        className: "header-right"
    }, headerRight)), /*#__PURE__*/ React.createElement("div", {
        className: "page-content"
    }, children));
};
export default PageContainer;
