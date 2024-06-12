import { React } from "/modules/official/stdlib/src/expose/React.js";
import { t } from "../i18n.js";
import { RootModule } from "/hooks/module.js";
import ModuleCard from "../components/ModuleCard/index.js";
import { hash, settingsButton } from "../../index.js";
import { CONFIG } from "../settings.js";
import { getProp, TreeNodeVal, useChipFilter, useDropdown, useSearchBar } from "/modules/official/stdlib/lib/components/index.js";
import { usePanelAPI } from "/modules/official/stdlib/src/webpack/CustomHooks.js";
const SortOptions = {
    default: ()=>t("sort.default"),
    "a-z": ()=>t("sort.a-z"),
    "z-a": ()=>t("sort.z-a"),
    random: ()=>t("sort.random")
};
const SortFns = {
    default: null,
    "a-z": (a, b)=>b.name > a.name ? 1 : a.name > b.name ? -1 : 0,
    "z-a": (a, b)=>a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
    random: ()=>Math.random() - 0.5
};
const enabled = {
    enabled: {
        [TreeNodeVal]: t("filter.enabled")
    }
};
const getFilters = ()=>React.useMemo(()=>({
            [TreeNodeVal]: null,
            themes: {
                [TreeNodeVal]: t("filter.themes"),
                ...enabled
            },
            extensions: {
                [TreeNodeVal]: t("filter.extensions"),
                ...enabled
            },
            apps: {
                [TreeNodeVal]: t("filter.apps"),
                ...enabled
            },
            snippets: {
                [TreeNodeVal]: t("filter.snippets"),
                ...enabled
            },
            libs: {
                [TreeNodeVal]: CONFIG.showLibs && t("filter.libs")
            }
        }), [
        CONFIG.showLibs
    ]);
const libTags = new Set([
    "lib",
    "npm",
    "internal"
]);
const isModLib = (m)=>new Set(m.metadata?.tags).intersection(libTags).size > 0;
const enabledFn = {
    enabled: {
        [TreeNodeVal]: (m)=>"isLoaded" in m && m.isLoaded()
    }
};
const filterFNs = {
    [TreeNodeVal]: (mi)=>CONFIG.showLibs || !isModLib(mi),
    themes: {
        [TreeNodeVal]: (mi)=>mi.metadata?.tags.includes("theme") ?? false,
        ...enabledFn
    },
    apps: {
        [TreeNodeVal]: (mi)=>mi.metadata?.tags.includes("app") ?? false,
        ...enabledFn
    },
    extensions: {
        [TreeNodeVal]: (mi)=>mi.metadata?.tags.includes("extension") ?? false,
        ...enabledFn
    },
    snippets: {
        [TreeNodeVal]: (mi)=>mi.metadata?.tags.includes("snippet") ?? false,
        ...enabledFn
    },
    libs: {
        [TreeNodeVal]: isModLib
    }
};
export let unselect;
export let refresh;
const getModuleInsts = ()=>{
    const modules = RootModule.INSTANCE.getAllDescendantsByBreadth();
    const moduleInstances = Object.groupBy(modules, (module)=>module.getIdentifier());
    return moduleInstances;
};
const dummy_metadata = {
    name: "",
    tags: [],
    preview: "",
    version: "0.0.0",
    authors: [],
    description: "",
    readme: "",
    entries: {},
    dependencies: {}
};
export default function() {
    const [searchbar, search] = useSearchBar({
        placeholder: t("pages.marketplace.search_modules"),
        expanded: true
    });
    const [sortbox, sortOption] = useDropdown({
        options: SortOptions
    });
    const sortFn = SortFns[sortOption];
    const [chipFilter, selectedFilters] = useChipFilter(getFilters());
    const getSelectedFilterFNs = ()=>selectedFilters.map(({ key })=>getProp(filterFNs, key));
    const selectedFilterFNs = React.useMemo(getSelectedFilterFNs, [
        selectedFilters
    ]);
    const [modules] = React.useState(getModuleInsts);
    const getModuleToInst = (modules)=>Object.fromEntries(Object.entries(modules).flatMap(([identifier, modules])=>{
            let selected = null;
            for (const module of modules){
                const version = module.getEnabledVersion() || module.instances.keys().next().value;
                if (version) {
                    selected = module.instances.get(version);
                    break;
                }
            }
            return selected ? [
                [
                    identifier,
                    selected
                ]
            ] : [];
        }));
    const [moduleToInstance, selectInstance] = React.useReducer((moduleToInst, moduleInstance)=>({
            ...moduleToInst,
            [moduleInstance.getModuleIdentifier()]: moduleInstance
        }), modules, getModuleToInst);
    const insts = React.useMemo(()=>Array.from(Object.values(moduleToInstance)), [
        moduleToInstance
    ]);
    const moduleCardProps = selectedFilterFNs.reduce((acc, fn)=>acc.filter(fn[TreeNodeVal]), insts).filter((moduleInst)=>{
        const { name, tags, authors } = moduleInst.metadata ?? dummy_metadata;
        const searchFiels = [
            name,
            ...tags,
            ...authors
        ];
        return searchFiels.some((f)=>f.toLowerCase().includes(search.toLowerCase()));
    }).sort((a, b)=>sortFn?.(a.metadata ?? dummy_metadata, b.metadata ?? dummy_metadata));
    const [selectedModule, selectModule] = React.useState(null);
    const _unselect = ()=>selectModule(null);
    const [, _refresh] = React.useReducer((n)=>n + 1, 0);
    React.useEffect(()=>{
        unselect = _unselect;
        refresh = _refresh;
        return ()=>{
            unselect = undefined;
            refresh = undefined;
        };
    }, []);
    const { panelSend } = usePanelAPI();
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("section", {
        className: "contentSpacing"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header items-center flex justify-between pb-2 flex-row z-10"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header__left flex gap-2"
    }, chipFilter), /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header__right flex gap-2 items-center"
    }, /*#__PURE__*/ React.createElement("p", {
        className: "inline-flex self-center font-bold text-sm"
    }, t("pages.marketplace.sort.label")), sortbox, searchbar, settingsButton)), /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-grid iKwGKEfAfW7Rkx2_Ba4E soGhxDX6VjS7dBxX9Hbd"
    }, moduleCardProps.map((moduleInst)=>{
        const module = moduleInst.getModule();
        const moduleIdentifier = module.getIdentifier();
        const isSelected = moduleIdentifier === selectedModule;
        return /*#__PURE__*/ React.createElement(ModuleCard, {
            key: moduleIdentifier,
            modules: modules[moduleIdentifier],
            moduleInstance: moduleInst,
            isSelected: isSelected,
            selectInstance: selectInstance,
            onClick: ()=>{
                if (isSelected) {
                    panelSend("panel_close_click_or_collapse");
                } else {
                    if (!selectedModule && hash) {
                        panelSend?.(hash.event);
                    }
                    selectModule(module.getIdentifier());
                }
            }
        });
    }))));
}
