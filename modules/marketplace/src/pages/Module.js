import { React } from "/modules/official/stdlib/src/expose/React.js";
import { ReactDOM } from "/modules/official/stdlib/src/webpack/React.js";
import Button from "../components/Button/index.js";
import LoadingIcon from "../components/Icons/LoadingIcon.js";
import TrashIcon from "../components/Icons/TrashIcon.js";
import { t } from "../i18n.js";
import { renderMarkdown } from "../api/github.js";
import { logger } from "../../index.js";
import { LocalModuleInstance, RootModule } from "/hooks/module.js";
import { fetchJSON } from "/hooks/util.js";
import { useQuery, useSuspenseQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.js";
import { module as marketplaceModuleInstance } from "/modules/Delusoire/marketplace/index.js";
const ShadowRoot = ({ mode, delegatesFocus, styleSheets, children })=>{
    const node = React.useRef(null);
    const [root, setRoot] = React.useState(null);
    React.useLayoutEffect(()=>{
        if (node.current) {
            const root = node.current.attachShadow({
                mode,
                delegatesFocus
            });
            if (styleSheets.length > 0) {
                root.adoptedStyleSheets = styleSheets;
            }
            setRoot(root);
        }
    }, [
        node,
        styleSheets
    ]);
    const content = root && ReactDOM.createPortal(children, root);
    return /*#__PURE__*/ React.createElement("div", {
        ref: node
    }, content);
};
const RemoteMarkdown = React.memo(({ url })=>{
    const { status, error, data: markdown } = useQuery({
        queryKey: [
            "markdown",
            url
        ],
        queryFn: ()=>fetch(url).then((res)=>res.text()).then((markdown)=>renderMarkdown(markdown))
    });
    const fixRelativeImports = (markdown)=>markdown.replace(/(src|href)="\.\//g, `$1="${url}/../`);
    switch(status){
        case "pending":
            {
                return /*#__PURE__*/ React.createElement("footer", {
                    className: "m-auto text-center"
                }, /*#__PURE__*/ React.createElement(LoadingIcon, null));
            }
        case "success":
            {
                return /*#__PURE__*/ React.createElement(ShadowRoot, {
                    mode: "open",
                    delegatesFocus: true,
                    styleSheets: []
                }, /*#__PURE__*/ React.createElement("style", null, '@import "https://cdn.jsdelivr.xyz/npm/water.css@2/out/water.css";'), /*#__PURE__*/ React.createElement("div", {
                    id: "module-readme",
                    className: "select-text",
                    dangerouslySetInnerHTML: {
                        __html: fixRelativeImports(markdown)
                    }
                }));
            }
        case "error":
            {
                logger.error(error);
                return "Something went wrong.";
            }
    }
});
async function getLocalModuleInstance(moduleIdentifier, version) {
    const localModule = RootModule.INSTANCE.getChild(moduleIdentifier);
    const localModuleInstance = await localModule?.instances.get(version);
    return localModuleInstance;
}
async function createRemoteModuleInstance(moduleIdentifier, version, aurl) {
    const marketplaceModule = marketplaceModuleInstance.getModule();
    const remoteModule = await marketplaceModule.getChildOrNew(moduleIdentifier);
    const remoteModuleInstance = await remoteModule.newInstance(version, {
        installed: false,
        artifacts: [
            aurl
        ],
        providers: []
    });
    return remoteModuleInstance;
}
function useModuleInstance(moduleIdentifier, version, aurl) {
    const local = useQuery({
        queryKey: [
            "getLocalModuleInstance",
            moduleIdentifier,
            version
        ],
        queryFn: ()=>getLocalModuleInstance(moduleIdentifier, version)
    });
    const remote = useQuery({
        queryKey: [
            "createRemoteModuleInstance",
            moduleIdentifier,
            version,
            aurl
        ],
        queryFn: ()=>createRemoteModuleInstance(moduleIdentifier, version, aurl),
        enabled: local.isSuccess && !local.data
    });
    return [
        local.data ?? remote.data,
        local.refetch
    ];
}
export default function({ aurl }) {
    const basnename = aurl.slice(aurl.lastIndexOf("/") + 1);
    const match = basnename.match(/^(<moduleIdentifier>[^@]+)@(<version>[^@]+)\.zip$/);
    if (!match || !match.groups) {
        return /*#__PURE__*/ React.createElement("div", null, "Invalid module URL");
    }
    const { moduleIdentifier, version } = match.groups;
    const murl = aurl.replace(/\.zip$/, ".metadata.json");
    const { data: metadata } = useSuspenseQuery({
        queryKey: [
            "modulePage",
            murl
        ],
        queryFn: ()=>fetchJSON(murl)
    });
    const [moduleInstance, refetchModuleInstance] = useModuleInstance(moduleIdentifier, version, aurl);
    if (!metadata || !moduleInstance) {
        return;
    }
    const isLocal = moduleInstance instanceof LocalModuleInstance;
    const label = t(isLocal ? "pages.module.remove" : "pages.module.install");
    const sharedButtonProps = {
        label,
        metadata,
        onUpdate: refetchModuleInstance
    };
    const Button = isLocal ? /*#__PURE__*/ React.createElement(TrashButton, {
        ...sharedButtonProps,
        moduleInstance: moduleInstance
    }) : /*#__PURE__*/ React.createElement(DownloadButton, {
        ...sharedButtonProps,
        moduleInstance: moduleInstance
    });
    return /*#__PURE__*/ React.createElement("section", {
        className: "contentSpacing"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header items-center flex justify-between pb-2 flex-row z-10"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header__left flex gap-2"
    }, /*#__PURE__*/ React.createElement("h1", null, t("pages.module.title"))), /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header__right flex gap-2"
    }, Button)), /*#__PURE__*/ React.createElement(RemoteMarkdown, {
        url: metadata.readme
    }));
}
const TrashButton = (props)=>{
    return /*#__PURE__*/ React.createElement(Button, {
        label: props.label,
        onClick: async (e)=>{
            e.preventDefault();
            if (await props.moduleInstance.remove()) {
                props.onUpdate();
            }
        }
    }, /*#__PURE__*/ React.createElement(TrashIcon, null), props.label);
};
const DownloadButton = (props)=>{
    return /*#__PURE__*/ React.createElement(Button, {
        label: props.label,
        onClick: async (e)=>{
            e.preventDefault();
            if (await props.moduleInstance.add()) {
                props.onUpdate();
            }
        }
    }, /*#__PURE__*/ React.createElement(TrashIcon, null), props.label);
};
