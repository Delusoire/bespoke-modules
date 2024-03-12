import { S } from "../src/expose/index.js";
const { Locale } = S;
const { GenericModal, Text } = S.ReactComponents;
import RootRegistry from "../src/registers/root.js";
import { createIconComponent } from "./createIconComponent.js";
let close = undefined;
let ref = undefined;
export function display({ title: contentLabel, content: children, isLarge: isEmbedWidgetGeneratorOrTrackCreditsModal }) {
    hide();
    const PopupModal = ()=>{
        const [isOpen, setIsOpen] = S.React.useState(true);
        close = ()=>setIsOpen(false);
        if (isEmbedWidgetGeneratorOrTrackCreditsModal) {
            return /*#__PURE__*/ S.React.createElement(GenericModal, {
                isOpen: isOpen,
                contentLabel: contentLabel
            }, /*#__PURE__*/ S.React.createElement("div", {
                className: "uUYNnjSt8m3EqVjsnHgh",
                style: {
                    overflow: "scroll",
                    width: "60vw"
                }
            }, /*#__PURE__*/ S.React.createElement("div", {
                className: "bOIRpQiHUAEfp8ntStTo"
            }, /*#__PURE__*/ S.React.createElement(Text, {
                as: "h1",
                variant: "titleSmall"
            }, contentLabel), /*#__PURE__*/ S.React.createElement("button", {
                className: "oBoIIlKrwQjxXpvOiOa0",
                onClick: close
            }, createIconComponent({
                icon: "<path d='M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06Z'/>",
                "aria-label": Locale.get("close")
            }))), /*#__PURE__*/ S.React.createElement("div", {
                className: "IJHNf0vxPSbPE1egoG4N"
            }, children)));
        }
        return /*#__PURE__*/ S.React.createElement(GenericModal, {
            isOpen: isOpen,
            contentLabel: contentLabel
        }, /*#__PURE__*/ S.React.createElement("div", {
            className: "uV8q95GGAb2VDtL3gpYa"
        }, /*#__PURE__*/ S.React.createElement("div", {
            className: "pGU_qEtNT1qWKjrRbvan"
        }, /*#__PURE__*/ S.React.createElement(Text, {
            as: "h1",
            variant: "titleMedium"
        }, contentLabel), /*#__PURE__*/ S.React.createElement("button", {
            className: "VKCcyYujazVPj6VkksPM",
            "aria-label": Locale.get("close"),
            onClick: close
        }, createIconComponent({
            icon: "<path d='M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06Z'/>",
            "aria-label": Locale.get("close"),
            iconSize: 18
        }))), /*#__PURE__*/ S.React.createElement("div", {
            className: "Nw1INlIyra3LT1JjvoqH"
        }, children)));
    };
    ref = S.React.createElement(PopupModal);
    RootRegistry.register(ref, ()=>true);
}
export function hide() {
    close?.();
    ref && RootRegistry.unregister(ref);
}
