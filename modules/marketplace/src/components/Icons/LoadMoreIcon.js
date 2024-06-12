import { React } from "/modules/official/stdlib/src/expose/React.js";
export default function({ onClick }) {
    return /*#__PURE__*/ React.createElement("div", {
        onClick: onClick
    }, /*#__PURE__*/ React.createElement("p", {
        style: {
            fontSize: 100,
            lineHeight: "65px"
        }
    }, "»"), /*#__PURE__*/ React.createElement("span", {
        style: {
            fontSize: 20
        }
    }, "Load more"));
}
