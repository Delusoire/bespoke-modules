import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.js";
import { _ } from "/modules/official/stdlib/deps.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
const formatValue = (name, value)=>{
    if (typeof value === "string") return value;
    switch(name){
        case "tempo":
            return `${Math.round(value)} bpm`;
        case "popularity":
            return `${Math.round(value)} %`;
        default:
            return `${Math.round(value * 100)} %`;
    }
};
const StatCard = ({ label, value })=>/*#__PURE__*/ React.createElement("div", {
        className: "main-card-card"
    }, /*#__PURE__*/ React.createElement(UI.Type, {
        as: "div",
        semanticColor: "textBase",
        variant: "alto"
    }, formatValue(label, value)), /*#__PURE__*/ React.createElement(UI.Type, {
        as: "div",
        semanticColor: "textBase",
        variant: "balladBold"
    }, _.capitalize(label)));
export default StatCard;
