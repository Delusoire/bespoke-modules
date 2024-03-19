import CreatePlaylistButton from "../buttons/create_playlist_button.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
const PageContainer = (props)=>{
    const { title, createPlaylistButtonProps, headerEls, children } = props;
    const { TextComponent } = S.ReactComponents;
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
    }, title), createPlaylistButtonProps && /*#__PURE__*/ S.React.createElement(CreatePlaylistButton, createPlaylistButtonProps)), /*#__PURE__*/ S.React.createElement("div", {
        className: "header-right"
    }, headerEls)), /*#__PURE__*/ S.React.createElement("div", {
        className: "page-content"
    }, children));
};
export default PageContainer;
