import { S } from "/modules/Delusoire/stdlib/index.js";
import { SVGIcons, createRegistrar } from "/modules/Delusoire/stdlib/index.js";
import { display } from "/modules/Delusoire/stdlib/lib/modal.js";
import { Button } from "/modules/Delusoire/stdlib/src/registers/topbarLeftButton.js";
import SchemerModal from "./modal.js";
import * as sm from "./schemes.js";
const SchemeEdit = ()=>{
    return /*#__PURE__*/ S.React.createElement(Button, {
        label: "playlist-stats",
        icon: SVGIcons.edit,
        onClick: ()=>{
            display({
                title: "Schemer",
                content: /*#__PURE__*/ S.React.createElement(SchemerModal, null),
                isLarge: true
            });
        }
    });
};
export default function(mod) {
    const registrar = createRegistrar(mod);
    registrar.register("topbarLeftButton", SchemeEdit);
    test();
}
function test() {
    window.sm = sm;
    sm.create_statics([
        {
            name: "Red Text",
            fields: {
                text: "#ff0000"
            }
        },
        {
            name: "Green Text",
            fields: {
                text: "#00ff00"
            }
        },
        {
            name: "Blue Text",
            fields: {
                text: "#0000ff"
            }
        }
    ], "default");
    sm.create_statics([
        {
            name: "Nord",
            fields: {
                main: "#2e3440"
            }
        }
    ], "cool theme");
// sm.create_local({ name: "Cyan", fields: { text: "#00ffff" } });
// sm.create_local({ name: "Magenta", fields: { text: "#ff00ff" } });
// sm.create_local({ name: "Yellow", fields: { text: "#ffff00" } });
// sm.toggle_scheme("Cyan");
}
