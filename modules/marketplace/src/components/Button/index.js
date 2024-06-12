import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
export default function({ onClick, className, label = "", type = "round", children, disabled = false }) {
    const btnClass = classnames("spicetify-marketplace-button", {
        "[&_svg]:absolute [&_svg]:top-1/2 [&_svg]:left-1/2 [&_svg]:-translate-y-1/2 [&_svg]:-translate-x-1/2 ps-4 pe-4 w-12 h-12": type === "circle"
    }, className);
    return /*#__PURE__*/ React.createElement("button", {
        className: btnClass,
        onClick: onClick,
        "aria-label": label,
        disabled: disabled
    }, children);
}
