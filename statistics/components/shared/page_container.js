import { categories, selectedCategoryCtx } from "../../app.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
import { TopNavBar } from "/modules/Delusoire/stdlib/lib/components/MountedNavBar.js";
const { React } = S;
const PageContainer = (props)=>{
    const { title, headerLeft, headerRight, children } = props;
    const { TextComponent } = S.ReactComponents;
    const selectedCategory = React.useContext(selectedCategoryCtx);
    return /*#__PURE__*/ S.React.createElement("section", {
        className: "contentSpacing"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "page-header"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "header-left"
    }, /*#__PURE__*/ S.React.createElement(TextComponent, {
        as: "h1",
        variant: "canon",
        semanticColor: "textBase"
    }, title), headerLeft, /*#__PURE__*/ S.React.createElement(TopNavBar, {
        categories: categories,
        selectedCategory: selectedCategory
    })), /*#__PURE__*/ S.React.createElement("div", {
        className: "header-right"
    }, headerRight)), /*#__PURE__*/ S.React.createElement("div", {
        className: "page-content"
    }, children));
};
export default PageContainer;
