import Marketplace from "./pages/Marketplace.js";
import ModulePage from "./pages/Module.js";
import { Routes, Route } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
import { useMatch } from "/modules/official/stdlib/src/webpack/ReactRouter.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
export default function() {
    const match = useMatch("/bespoke/marketplace/:aurl");
    const aurl = decodeURIComponent(match?.params?.aurl);
    return /*#__PURE__*/ React.createElement("div", {
        id: "marketplace"
    }, /*#__PURE__*/ React.createElement(Routes, null, /*#__PURE__*/ React.createElement(Route, {
        path: "/",
        element: /*#__PURE__*/ React.createElement(Marketplace, null)
    }), /*#__PURE__*/ React.createElement(Route, {
        path: ":murl",
        element: /*#__PURE__*/ React.createElement(ModulePage, {
            aurl: aurl
        })
    })));
}
