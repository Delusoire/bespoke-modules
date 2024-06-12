import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.js";
import { _ } from "/modules/official/stdlib/deps.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
const pitchClasses = [
    "do",
    "do♯/re♭",
    "re",
    "re♯/mi♭",
    "mi",
    "fa",
    "fa♯/sol♭",
    "sol",
    "sol♯/la♭",
    "la",
    "la♯/si♭",
    "si"
];
const formatValue = (name, value)=>{
    if (typeof value === "string") return value;
    switch(name){
        case "acousticness":
        case "danceability":
        case "energy":
        case "instrumentalness":
        case "liveness":
        case "speechiness":
        case "valence":
            return `${Math.round(value * 100)} %`;
        case "key":
            return pitchClasses[Math.round(value)];
        case "loudness":
            return `${value.toFixed(1)} db`;
        case "tempo":
            return `${Math.round(value)} bpm`;
        case "time_signature":
            return `${Math.round(value)}/4`;
        default:
            return value.toFixed(2);
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
