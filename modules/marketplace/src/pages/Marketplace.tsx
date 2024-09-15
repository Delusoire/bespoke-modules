import { React } from "/modules/stdlib/src/expose/React.ts";
import { t } from "../i18n.ts";
import { type Metadata, type Module, type ModuleIdentifier, type ModuleInstance } from "/hooks/module.ts";
import ModuleCard from "../components/ModuleCard/index.tsx";
import { hash, settingsButton } from "../../mod.tsx";
import { CONFIG } from "../settings.ts";
import {
	getProp,
	type RTree,
	TreeNodeVal,
	useChipFilter,
	useDropdown,
	useSearchBar,
} from "/modules/stdlib/lib/components/index.tsx";
import { usePanelAPI } from "/modules/stdlib/src/webpack/ReactHooks.ts";
import { useModules } from "../components/ModulesProvider/index.tsx";

const SortOptions = {
	default: () => t("sort.default"),
	"a-z": () => t("sort.a-z"),
	"z-a": () => t("sort.z-a"),
	random: () => t("sort.random"),
};
const SortFns: Record<
	keyof typeof SortOptions,
	null | ((a: Metadata, b: Metadata) => number | boolean)
> = {
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
const isModLib = (m: ModuleInstance) => new Set(m.metadata?.tags).intersection(libTags).size > 0;
const enabledFn = {
	enabled: {
		[TreeNodeVal]: (m: ModuleInstance) => "isLoaded" in m && m.isLoaded(),
	},
};

const filterFNs: RTree<(m: ModuleInstance) => boolean> = {
	[TreeNodeVal]: (mi) => CONFIG.showLibs || !isModLib(mi),
	themes: {
		[TreeNodeVal]: (mi) => mi.metadata?.tags.includes("theme") ?? false,
		...enabledFn,
	},
	apps: {
		[TreeNodeVal]: (mi) => mi.metadata?.tags.includes("app") ?? false,
		...enabledFn,
	},
	extensions: {
		[TreeNodeVal]: (mi) => mi.metadata?.tags.includes("extension") ?? false,
		...enabledFn,
	},
	snippets: {
		[TreeNodeVal]: (mi) => mi.metadata?.tags.includes("snippet") ?? false,
		...enabledFn,
	},
	libs: { [TreeNodeVal]: isModLib },
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

export default React.memo(() => {
	const {
		modules,
		moduleToInstance,
		selectedModules,

		updateModules,
		updateModule,
		removeModule,
		selectModules,
		addModule,
		selectInstance,
	} = useModules();

	React.useEffect(() => {
		updateModules();
	}, []);

	return (
		<MarketplaceContent
			modules={modules}
			moduleToInstance={moduleToInstance}
			selectedModules={selectedModules}
			updateModules={updateModules}
			updateModule={updateModule}
			removeModule={removeModule}
			selectModules={selectModules}
			addModule={addModule}
			selectInstance={selectInstance}
		/>
	);
});

interface MarketplaceContentProps {
	modules: Record<string, [Module]>;
	moduleToInstance: Record<string, ModuleInstance>;
	selectedModules: ModuleIdentifier[];
	updateModules: () => void;
	updateModule: (module: Module) => void;
	removeModule: (module: Module) => void;
	selectModules: React.Dispatch<React.SetStateAction<ModuleIdentifier[]>>;
	addModule: (module: Module) => void;
	selectInstance: (moduleInstance: ModuleInstance) => void;
}
const MarketplaceContent = (props: MarketplaceContentProps) => {
	const [searchbar, search] = useSearchBar({
		placeholder: t("pages.marketplace.search_modules"),
		expanded: true,
	});

	const [sortbox, sortOption] = useDropdown({ options: SortOptions });
	const sortFn = SortFns[sortOption];

	const [chipFilter, selectedFilters] = useChipFilter(getFilters());

	const getSelectedFilterFNs = () =>
		selectedFilters.map(({ key }) => getProp(filterFNs, key) as typeof filterFNs);
	const selectedFilterFNs = React.useMemo(getSelectedFilterFNs, [
		selectedFilters,
	]);

	const {
		modules,
		updateModule,
		updateModules,
		selectInstance,
		addModule,
		removeModule,
		moduleToInstance,
		selectedModules,
		selectModules,
	} = props;

	const allModuleInstances = React.useMemo(
		() => Array.from(Object.values(moduleToInstance)),
		[moduleToInstance],
	);

	const moduleInstances = selectedFilterFNs
		.reduce((acc, fn) => acc.filter(fn[TreeNodeVal]), allModuleInstances)
		.filter((moduleInst) => {
			const { name, tags, authors } = moduleInst.metadata ?? dummy_metadata;
			const searchFiels = [name, ...tags, ...authors];
			return searchFiels.some((f) => f.toLowerCase().includes(search.toLowerCase()));
		})
		.sort((a, b) =>
			sortFn?.(
				a.metadata ?? dummy_metadata,
				b.metadata ?? dummy_metadata,
			) as number
		);

	const { isActive, panelSend } = usePanelAPI(hash?.state);
	React.useEffect(() => {
		if (!hash) {
			return;
		}
		if (!isActive) {
			panelSend(hash.event);
		}
	}, [isActive, hash]);

	return (
		<>
			<section className="contentSpacing">
				<div className="marketplace-header items-center flex justify-between py-2 flex-row z-10">
					<div className="marketplace-header__left flex gap-2">
						{chipFilter}
					</div>
					<div className="marketplace-header__right flex gap-2 items-center">
						<p className="inline-flex self-center font-bold text-sm">
							{t("pages.marketplace.sort.label")}
						</p>
						{sortbox}
						{searchbar}
						{settingsButton}
					</div>
				</div>
				<ModuleInstancesContext.Provider value={moduleInstances}>
					<div className="marketplace-grid iKwGKEfAfW7Rkx2_Ba4E soGhxDX6VjS7dBxX9Hbd">
						{moduleInstances.map((moduleInst) => {
							const module = moduleInst.getModule();
							const moduleIdentifier = module.getIdentifier();
							const isSelected = selectedModules.includes(moduleIdentifier);
							return (
								<ModuleCard
									key={moduleIdentifier}
									moduleInstance={moduleInst}
									isSelected={isSelected}
									selectModules={selectModules}
									updateModules={updateModules}
									updateModule={updateModule}
									removeModule={removeModule}
									addModule={addModule}
									modules={modules[moduleIdentifier]}
									selectInstance={selectInstance}
								/>
							);
						})}
					</div>
				</ModuleInstancesContext.Provider>
			</section>
		</>
	);
};

export const ModuleInstancesContext = React.createContext<ModuleInstance[]>([]);
