import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { _ } from "/modules/official/stdlib/deps.ts";
import { t } from "../i18n.ts";
import {
	LocalModuleInstance,
	type Metadata,
	Module,
	ModuleIdentifier,
	RemoteModuleInstance,
	RootModule,
} from "/hooks/module.ts";
import ModuleCard from "../components/ModuleCard/index.tsx";
import { hash, settingsButton } from "../../index.tsx";
import { CONFIG } from "../settings.ts";
import {
	getProp,
	type RTree,
	TreeNodeVal,
	useChipFilter,
	useDropdown,
	useSearchBar,
} from "/modules/official/stdlib/lib/components/index.tsx";
import { usePanelAPI } from "/modules/official/stdlib/src/webpack/CustomHooks.ts";
import { ReactDOM } from "/modules/official/stdlib/src/webpack/React.ts";
import { VersionListPanel } from "/modules/Delusoire/marketplace/src/components/VersionList/index.tsx";
import { LocalModule, RemoteModule } from "/hooks/module.ts";
import module from "../../../../../bespoke-module-template/module/index.js";

const SortOptions = {
	default: () => t("sort.default"),
	"a-z": () => t("sort.a-z"),
	"z-a": () => t("sort.z-a"),
	random: () => t("sort.random"),
};
const SortFns: Record<keyof typeof SortOptions, null | ((a: Metadata, b: Metadata) => number | boolean)> = {
	default: null,
	"a-z": (a, b) => (b.name > a.name ? 1 : a.name > b.name ? -1 : 0),
	"z-a": (a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0),
	random: () => Math.random() - 0.5,
};

const enabled = { enabled: { [TreeNodeVal]: t("filter.enabled") } };

const getFilters = () =>
	React.useMemo(() => ({
		[TreeNodeVal]: null,
		themes: { [TreeNodeVal]: t("filter.themes"), ...enabled },
		extensions: { [TreeNodeVal]: t("filter.extensions"), ...enabled },
		apps: { [TreeNodeVal]: t("filter.apps"), ...enabled },
		snippets: { [TreeNodeVal]: t("filter.snippets"), ...enabled },
		libs: { [TreeNodeVal]: CONFIG.showLibs && t("filter.libs") },
	}), [CONFIG.showLibs]);

const libTags = new Set(["lib", "npm", "internal"]);
const isModLib = (m: MI) => new Set(m.metadata?.tags).intersection(libTags).size > 0;
const enabledFn = { enabled: { [TreeNodeVal]: (m: MI) => "isLoaded" in m && m.isLoaded() } };

const filterFNs: RTree<(m: MI) => boolean> = {
	[TreeNodeVal]: (mi) => CONFIG.showLibs || !isModLib(mi),
	themes: { [TreeNodeVal]: (mi) => mi.metadata?.tags.includes("theme") ?? false, ...enabledFn },
	apps: { [TreeNodeVal]: (mi) => mi.metadata?.tags.includes("app") ?? false, ...enabledFn },
	extensions: { [TreeNodeVal]: (mi) => mi.metadata?.tags.includes("extension") ?? false, ...enabledFn },
	snippets: { [TreeNodeVal]: (mi) => mi.metadata?.tags.includes("snippet") ?? false, ...enabledFn },
	libs: { [TreeNodeVal]: isModLib },
};

export let refresh: (() => void) | undefined;

export type MI = LocalModuleInstance | RemoteModuleInstance;

type Req<T> = {
	[P in keyof T]-?: T[P] & {};
};

const dummy_metadata: Metadata = {
	name: "",
	tags: [],
	preview: "",
	version: "0.0.0",
	authors: [],
	description: "",
	readme: "",
	entries: {},
	dependencies: {},
};

export default function () {
	const [searchbar, search] = useSearchBar({
		placeholder: t("pages.marketplace.search_modules"),
		expanded: true,
	});

	const [sortbox, sortOption] = useDropdown({ options: SortOptions });
	const sortFn = SortFns[sortOption];

	const [chipFilter, selectedFilters] = useChipFilter(getFilters());

	const getSelectedFilterFNs = () =>
		selectedFilters.map(({ key }) => getProp(filterFNs, key) as typeof filterFNs);
	const selectedFilterFNs = React.useMemo(getSelectedFilterFNs, [selectedFilters]);

	const { modules, addModule, removeModule, updateModule, moduleToInstance, selectInstance } =
		useOverlySmartHook();

	const instances = React.useMemo(() => Array.from(Object.values(moduleToInstance)), [moduleToInstance]);

	const moduleCardProps = selectedFilterFNs
		.reduce((acc, fn) => acc.filter(fn[TreeNodeVal]), instances)
		.filter((moduleInst) => {
			const { name, tags, authors } = moduleInst.metadata ?? dummy_metadata;
			const searchFiels = [name, ...tags, ...authors];
			return searchFiels.some((f) => f.toLowerCase().includes(search.toLowerCase()));
		})
		.sort((a, b) => sortFn?.(a.metadata ?? dummy_metadata, b.metadata ?? dummy_metadata) as number);

	const [selectedModule, selectModule] = React.useState<ModuleIdentifier | null>(null);
	const [, rerender] = React.useReducer((n) => n + 1, 0);

	React.useEffect(() => {
		refresh = rerender;
		return () => {
			refresh = undefined;
		};
	}, []);

	const { isActive, panelSend } = usePanelAPI(hash?.state);
	React.useEffect(() => {
		if (!hash) {
			return;
		}
		if (!isActive) {
			panelSend(hash.event);
		}
	}, [isActive, hash]);

	const onModuleClick = React.useCallback((module: LocalModule | RemoteModule, isSelected: boolean) => {
		if (isSelected) {
			selectModule(null);
		} else {
			selectModule(module.getIdentifier());
		}
	}, [panelSend, selectedModule]);

	const panelTarget: any = document.querySelector("#MarketplacePanel");
	let panel;
	if (panelTarget && selectedModule) {
		const _modules = modules[selectedModule];
		const instance = moduleToInstance[selectedModule];
		panel = ReactDOM.createPortal(
			<VersionListPanel
				modules={_modules}
				addModule={addModule}
				removeModule={removeModule}
				updateModule={updateModule}
				selectedInstance={instance}
				selectInstance={selectInstance}
			/>,
			panelTarget,
		);
	}

	return (
		<>
			<section className="contentSpacing">
				<div className="marketplace-header items-center flex justify-between pb-2 flex-row z-10">
					<div className="marketplace-header__left flex gap-2">{chipFilter}</div>
					<div className="marketplace-header__right flex gap-2 items-center">
						<p className="inline-flex self-center font-bold text-sm">
							{t("pages.marketplace.sort.label")}
						</p>
						{sortbox}
						{searchbar}
						{settingsButton}
					</div>
				</div>
				<div className="marketplace-grid iKwGKEfAfW7Rkx2_Ba4E soGhxDX6VjS7dBxX9Hbd">
					{moduleCardProps.map((moduleInst) => {
						const module = moduleInst.getModule();
						const moduleIdentifier = module.getIdentifier();
						const isSelected = moduleIdentifier === selectedModule;
						return (
							<ModuleCard
								key={moduleIdentifier}
								moduleInstance={moduleInst}
								isSelected={isSelected}
								onClick={onModuleClick}
								// @ts-ignore added to force rerenders
								modules={modules[moduleIdentifier]}
							/>
						);
					})}
				</div>
				{panel}
			</section>
		</>
	);
}

const getModulesByIdentifier = () => {
	const modules = RootModule.INSTANCE.getAllDescendantsByBreadth();
	const modulesByIdentifier = Object.groupBy(modules, (module) => module.getIdentifier());
	return modulesByIdentifier as Record<ModuleIdentifier, Array<LocalModule | RemoteModule>>;
};

const getModuleToInst = (modules: Record<ModuleIdentifier, Array<Module<Module<any>>>>) =>
	Object.fromEntries(
		Object.entries(modules).flatMap(([identifier, modules]) => {
			let selected: MI | null = null;

			for (const module of modules) {
				const version = module.getEnabledVersion() || module.instances.keys().next().value;
				if (version) {
					selected = module.instances.get(version) as MI;
					break;
				}
			}

			return selected ? [[identifier, selected]] : [];
		}),
	);

const useOverlySmartHook = () => {
	const [, rerender] = React.useReducer((n) => n + 1, 0);

	const [modules, setModules] = React.useState(getModulesByIdentifier);

	const updateModules = React.useCallback(() => setModules(getModulesByIdentifier), [setModules]);

	const setModulesForIdentifier = React.useCallback(
		(
			identifier: ModuleIdentifier,
			f: (_modules: Array<LocalModule | RemoteModule>) => Array<LocalModule | RemoteModule>,
		) => {
			setModules((modules) => {
				modules[identifier] = Array.from(f(modules[identifier] ?? []));
				return modules;
			});
			rerender();
		},
		[setModules],
	);

	const addModule = React.useCallback((module: LocalModule | RemoteModule) => {
		setModulesForIdentifier(module.getIdentifier(), (modules) => {
			const i = modules.indexOf(module);
			if (!~i) {
				modules.unshift(module);
			}
			return modules;
		});
	}, [setModules]);

	const removeModule = React.useCallback((module: LocalModule | RemoteModule) => {
		setModulesForIdentifier(module.getIdentifier(), (modules) => {
			const i = modules.indexOf(module);
			if (~i) {
				modules.splice(i, 1);
			}
			return modules;
		});
	}, [setModules]);

	const updateModule = React.useCallback((module: LocalModule | RemoteModule) => {
		setModulesForIdentifier(module.getIdentifier(), (modules) => modules);
	}, [setModules]);

	const [moduleToInstance, selectInstance] = React.useReducer(
		(moduleToInst: Record<ModuleIdentifier, MI>, moduleInstance: MI) => ({
			...moduleToInst,
			[moduleInstance.getModuleIdentifier()]: moduleInstance,
		}),
		modules,
		getModuleToInst,
	);

	return { modules, updateModules, addModule, removeModule, updateModule, moduleToInstance, selectInstance };
};
