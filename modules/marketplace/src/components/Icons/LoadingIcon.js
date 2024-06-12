import { React } from "/modules/official/stdlib/src/expose/React.js";
export default function() {
    return /*#__PURE__*/ React.createElement("svg", {
        width: "100px",
        height: "100px",
        viewBox: "0 0 100 100",
        preserveAspectRatio: "xMidYMid"
    }, /*#__PURE__*/ React.createElement("circle", {
        cx: "50",
        cy: "50",
        r: "0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
    }, /*#__PURE__*/ React.createElement("animate", {
        attributeName: "r",
        repeatCount: "indefinite",
        dur: "1s",
        values: "0;40",
        keyTimes: "0;1",
        keySplines: "0 0.2 0.8 1",
        calcMode: "spline",
        begin: "0s"
    }), /*#__PURE__*/ React.createElement("animate", {
        attributeName: "opacity",
        repeatCount: "indefinite",
        dur: "1s",
        values: "1;0",
        keyTimes: "0;1",
        keySplines: "0.2 0 0.8 1",
        calcMode: "spline",
        begin: "0s"
    })), /*#__PURE__*/ React.createElement("circle", {
        cx: "50",
        cy: "50",
        r: "0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
    }, /*#__PURE__*/ React.createElement("animate", {
        attributeName: "r",
        repeatCount: "indefinite",
        dur: "1s",
        values: "0;40",
        keyTimes: "0;1",
        keySplines: "0 0.2 0.8 1",
        calcMode: "spline",
        begin: "-0.5s"
    }), /*#__PURE__*/ React.createElement("animate", {
        attributeName: "opacity",
        repeatCount: "indefinite",
        dur: "1s",
        values: "1;0",
        keyTimes: "0;1",
        keySplines: "0.2 0 0.8 1",
        calcMode: "spline",
        begin: "-0.5s"
    })));
}
