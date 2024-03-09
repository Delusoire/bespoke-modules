import CreatePlaylistButton from "../buttons/create_playlist_button.js";
import { S } from "/modules/Delusoire/std/index.js";
const PageContainer = (props) => {
    const { title, createPlaylistButtonProps, headerEls, children } = props;
    const { TextComponent } = S.ReactComponents;
    return (S.React.createElement("section", { className: "contentSpacing" },
        S.React.createElement("div", { className: "page-header" },
            S.React.createElement("div", { className: "header-left" },
                S.React.createElement(TextComponent, { as: "h1", variant: "canon", semanticColor: "textBase" }, title),
                createPlaylistButtonProps && S.React.createElement(CreatePlaylistButton, { ...createPlaylistButtonProps })),
            S.React.createElement("div", { className: "header-right" }, headerEls)),
        S.React.createElement("div", { className: "page-content" }, children)));
};
export default PageContainer;
