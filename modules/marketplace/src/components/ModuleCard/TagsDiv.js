import { React } from "/modules/official/stdlib/src/expose/React.js";
import { MAX_TAGS } from "../../static.js";
import { t } from "../../i18n.js";
const knownTags = {
    [t("module.archived")]: "archived"
};
const Tag = (tag)=>/*#__PURE__*/ React.createElement("li", {
        className: "bg-[var(--spice-tab-active)] rounded pt-0 pb-1 px-2",
        draggable: false,
        "data-tag": knownTags[tag]
    }, tag);
export default function({ tags, importantTags, showTags }) {
    const [expanded, setExpanded] = React.useState(false);
    const filteredTags = showTags ? tags.filter((tag)=>![
            "theme",
            "app",
            "extension",
            "snippet",
            "lib"
        ].includes(tag)) : [];
    const baseTags = [
        importantTags,
        filteredTags
    ].flat();
    let extraTags = new Array();
    // If there are more than one extra tags, slice them and add an expand button
    if (baseTags.length > MAX_TAGS) {
        extraTags = baseTags.splice(MAX_TAGS);
    }
    return /*#__PURE__*/ React.createElement("div", {
        className: ""
    }, /*#__PURE__*/ React.createElement("ul", {
        className: "flex flex-wrap gap-2 text-sm"
    }, baseTags.map(Tag), expanded && extraTags.map(Tag)), !expanded && extraTags.length > 0 && /*#__PURE__*/ React.createElement("button", {
        className: "bg-[var(--spice-tab-active)] rounded pt-0 pb-1 px-2 mt-2 border-none hover:brightness-150 focus:brightness-150",
        onClick: (e)=>{
            e.stopPropagation();
            setExpanded(true);
        }
    }, "..."));
}
