import { S } from "/modules/Delusoire/stdlib/index.js";
const { React } = S;
function Shelf(props) {
    const { TextComponent } = S.ReactComponents;
    const { title, children } = props;
    return /*#__PURE__*/ S.React.createElement("section", {
        className: "QyANtc_r7ff_tqrf5Bvc Shelf"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "q8AZzDc_1BumBHZg0tZb"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "OMuRYOdpUbGif12_lRJl"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "onVWL7MW4PW9FyVajBAc"
    }, /*#__PURE__*/ S.React.createElement(TextComponent, {
        as: "h2",
        variant: "canon",
        semanticColor: "textBase"
    }, title)))), /*#__PURE__*/ S.React.createElement("section", null, children));
}
export default React.memo(Shelf);
