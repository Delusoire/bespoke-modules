import { React } from "/modules/official/stdlib/src/expose/React.js";
import AuthorsDiv from "./AuthorsDiv.js";
import TagsDiv from "./TagsDiv.js";
import { startCase } from "/modules/official/stdlib/deps.js";
import { useUpdate } from "../../util/index.js";
import { fetchJSON } from "/hooks/util.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { Cards, SettingToggle } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.js";
import { useQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.js";
import { VersionListPanel } from "../VersionList/index.js";
import { ReactDOM } from "/modules/official/stdlib/src/webpack/React.js";
const History = Platform.getHistory();
const fallbackImage = ()=>/*#__PURE__*/ React.createElement("svg", {
        "data-encore-id": "icon",
        role: "img",
        "aria-hidden": "true",
        "data-testid": "card-image-fallback",
        viewBox: "0 0 24 24",
        className: "fill-current",
        style: {
            width: "64px",
            height: "64px"
        }
    }, /*#__PURE__*/ React.createElement("path", {
        d: "M20.929,1.628A1,1,0,0,0,20,1H4a1,1,0,0,0-.929.628l-2,5A1.012,1.012,0,0,0,1,7V22a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V7a1.012,1.012,0,0,0-.071-.372ZM4.677,3H19.323l1.2,3H3.477ZM3,21V8H21V21Zm8-3a1,1,0,0,1-1,1H6a1,1,0,0,1,0-2h4A1,1,0,0,1,11,18Z"
    }));
export default function(props) {
    const { modules, moduleInstance: inst, selectInstance, showTags = true, onClick, isSelected } = props;
    const isEnabled = React.useCallback(()=>"isLoaded" in inst && inst.isLoaded(), [
        inst
    ]);
    const [enabled, setEnabled, updateEnabled] = useUpdate(isEnabled);
    const installed = "isInstalled" in inst && inst.isInstalled();
    const hasRemote = Boolean(inst.artifacts.length);
    const outdated = installed && hasRemote && false;
    const remoteMetadata = inst.getRemoteMetadata();
    const { data, isSuccess } = useQuery({
        queryKey: [
            "moduleCard",
            remoteMetadata
        ],
        queryFn: ()=>fetchJSON(remoteMetadata),
        enabled: inst.metadata === null && hasRemote
    });
    if (inst.metadata === null && isSuccess) {
        inst.updateMetadata(data);
    }
    const { name = inst.getModuleIdentifier(), description = inst.getVersion(), tags = [
        "available"
    ], authors = [], preview = "./assets/preview.gif" } = inst.metadata ?? {};
    const cardClasses = classnames("LunqxlFIupJw_Dkx6mNx", {
        "border-[var(--essential-warning)]": outdated,
        "bg-neutral-800": isSelected
    });
    const externalHref = inst.getRemoteArtifact();
    const metadataURL = installed ? inst.getRelPath("metadata.json") : remoteMetadata;
    const previewHref = metadataURL ? `${metadataURL}/../${preview}` : "";
    // TODO: add more important tags
    const importantTags = [].filter(Boolean);
    const panelTarget = document.querySelector("#MarketplacePanel");
    let panel;
    if (isSelected && panelTarget) {
        panel = ReactDOM.createPortal(/*#__PURE__*/ React.createElement(VersionListPanel, {
            modules: modules,
            selectedInstance: inst,
            selectInstance: selectInstance
        }), panelTarget);
    }
    return /*#__PURE__*/ React.createElement("div", {
        className: cardClasses
    }, panel, /*#__PURE__*/ React.createElement("div", {
        className: "border-[var(--essential-warning)] flex flex-col h-full",
        style: {
            pointerEvents: "all"
        },
        draggable: "true",
        onClick: onClick
    }, /*#__PURE__*/ React.createElement("div", {
        onClick: ()=>{
            metadataURL && History.push(`/bespoke/marketplace/${encodeURIComponent(metadataURL)}`);
        },
        style: {
            pointerEvents: "all",
            cursor: "pointer",
            marginBottom: "16px"
        }
    }, /*#__PURE__*/ React.createElement(Cards.CardImage, {
        images: [
            {
                url: previewHref
            }
        ],
        FallbackComponent: fallbackImage
    })), /*#__PURE__*/ React.createElement("div", {
        className: "flex flex-col gap-2 flex-grow"
    }, /*#__PURE__*/ React.createElement("a", {
        draggable: "false",
        title: name,
        className: "hover:underline",
        dir: "auto",
        href: externalHref,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: (e)=>e.stopPropagation()
    }, /*#__PURE__*/ React.createElement("div", {
        className: "main-type-balladBold"
    }, startCase(name))), /*#__PURE__*/ React.createElement("div", {
        className: "text-sm mx-0 whitespace-normal color-[var(--spice-subtext)] flex flex-col gap-2"
    }, /*#__PURE__*/ React.createElement(AuthorsDiv, {
        authors: authors
    })), /*#__PURE__*/ React.createElement("p", {
        className: "text-sm mx-0 overflow-hidden line-clamp-3 mb-auto"
    }, description || "No description for this package"), /*#__PURE__*/ React.createElement("div", {
        className: "text-[var(--spice-subtext)] whitespace-normal main-type-mestoBold"
    }, /*#__PURE__*/ React.createElement(TagsDiv, {
        tags: tags,
        showTags: showTags,
        importantTags: importantTags
    })), /*#__PURE__*/ React.createElement("div", {
        className: "flex justify-between"
    }, installed && enabled && SettingToggle && /*#__PURE__*/ React.createElement(SettingToggle, {
        className: "x-settings-button justify-end",
        value: enabled,
        onSelected: async (checked)=>{
            setEnabled(checked);
            const hasChanged = checked ? inst.load() : inst.unload();
            if (!await hasChanged) {
                updateEnabled();
            }
        }
    })))));
}
