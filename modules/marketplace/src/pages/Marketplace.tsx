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
	type Version,
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

export let unselect: (() => void) | undefined;
export let refresh: (() => void) | undefined;

export type MI = LocalModuleInstance | RemoteModuleInstance;

type Req<T> = {
	[P in keyof T]-?: T[P] & {};
};

const getModuleInsts = () => {
	const modules = RootModule.INSTANCE.getAllDescendantsByBreadth();
	const moduleInstances = Object.groupBy(modules, (module) => module.getIdentifier());
	return moduleInstances as Req<typeof moduleInstances>;
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

	const [modules] = React.useState(getModuleInsts);
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

	const [moduleToInstance, selectInstance] = React.useReducer(
		(moduleToInst: Record<ModuleIdentifier, MI>, moduleInstance: MI) => ({
			...moduleToInst,
			[moduleInstance.getModuleIdentifier()]: moduleInstance,
		}),
		modules,
		getModuleToInst,
	);
	const insts = React.useMemo(() => Array.from(Object.values(moduleToInstance)), [moduleToInstance]);

	const moduleCardProps = selectedFilterFNs
		.reduce((acc, fn) => acc.filter(fn[TreeNodeVal]), insts)
		.filter((moduleInst) => {
			const { name, tags, authors } = moduleInst.metadata ?? dummy_metadata;
			const searchFiels = [name, ...tags, ...authors];
			return searchFiels.some((f) => f.toLowerCase().includes(search.toLowerCase()));
		})
		.sort((a, b) => sortFn?.(a.metadata ?? dummy_metadata, b.metadata ?? dummy_metadata) as number);

	const [selectedModule, selectModule] = React.useState<ModuleIdentifier | null>(null);
	const _unselect = () => selectModule(null);
	const [, _refresh] = React.useReducer((n) => n + 1, 0);

	React.useEffect(() => {
		unselect = _unselect;
		refresh = _refresh;
		return () => {
			unselect = undefined;
			refresh = undefined;
		};
	}, []);

	const { panelSend } = usePanelAPI();

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
								modules={modules[moduleIdentifier]}
								moduleInstance={moduleInst}
								isSelected={isSelected}
								selectInstance={selectInstance}
								onClick={() => {
									if (isSelected) {
										panelSend("panel_close_click_or_collapse");
									} else {
										if (!selectedModule && hash) {
											panelSend?.(hash.event);
										}
										selectModule(module.getIdentifier());
									}
								}}
							/>
						);
					})}
				</div>
			</section>
		</>
	);
}
