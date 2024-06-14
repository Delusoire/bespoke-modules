import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.ts";
import { MI } from "../../pages/Marketplace.tsx";
import { useUpdate } from "../../util/index.ts";
import { LocalModule, LocalModuleInstance, ModuleIdentifier, RemoteModule } from "/hooks/module.ts";
import { RemoteModuleInstance } from "/hooks/module.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { useLocation, usePanelAPI } from "/modules/official/stdlib/src/webpack/CustomHooks.ts";
import {
	PanelContent,
	PanelHeader,
	PanelSkeleton,
} from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { ScrollableText } from "/modules/official/stdlib/src/webpack/ReactComponents.js";

export interface VersionListProps { }
export default function (props: VersionListProps) {
	const [ref, setRef] = React.useState<HTMLDivElement | null>(null);

	const m = React.useMemo(() => import("../../pages/Marketplace.tsx"), []);

	// TODO: remove
	React.useEffect(() => void m.then((m) => m.refresh?.()), [ref]);

	const location = useLocation();
	const { panelSend } = usePanelAPI();
	if (location.pathname !== "/bespoke/marketplace") {
		panelSend("panel_close_click_or_collapse");
	}

	return (
		<PanelSkeleton label="Marketplace">
			<PanelContent>
				<div
					id="MarketplacePanel"
					ref={(r) => setRef(r)}
				/>
			</PanelContent>
		</PanelSkeleton>
	);
}

export interface VersionListPanelProps {
	modules: Array<LocalModule | RemoteModule>;
	addModule: (module: LocalModule | RemoteModule) => void;
	removeModule: (module: LocalModule | RemoteModule) => void;
	updateModule: (module: LocalModule | RemoteModule) => void;
	selectedInstance: MI | null;
	selectInstance: (moduleInstance: MI) => void;
}
export const VersionListPanel = React.memo((props: VersionListPanelProps) => {
	if (!props.selectedInstance) {
		return <>
			<PanelHeader title="No module selected" />
			Select a module to view its versions.
		</>;
	}

	return <>
		<PanelHeader title={props.selectedInstance.getModuleIdentifier()} />
		<div className="p-4 flex flex-col rounded-lg shadow-md">
			{props.modules.map((module) => (
				<ModuleSection
					key={module.getHeritage().join("\x00")}
					module={module}
					addModule={props.addModule}
					removeModule={props.removeModule}
					updateModule={props.updateModule}
					selectedInstance={props.selectedInstance}
					selectInstance={props.selectInstance}
				/>
			))}
		</div>
	</>;
});

interface ModuleSectionProps<M extends LocalModule | RemoteModule = LocalModule | RemoteModule> {
	module: M;
	addModule: (module: LocalModule | RemoteModule) => void;
	removeModule: (module: LocalModule | RemoteModule) => void;
	updateModule: (module: LocalModule | RemoteModule) => void;
	selectedInstance: M["instances"] extends Map<ModuleIdentifier, infer I> ? I : never;
	selectInstance: (moduleInstance: MI) => void;
}
const ModuleSection = (props: ModuleSectionProps) =>
	props.module instanceof LocalModule
		? LocalModuleSection(props as ModuleSectionProps<LocalModule>)
		: RemoteModuleSection(props as ModuleSectionProps<RemoteModule>);

const LocalModuleSection = (props: ModuleSectionProps<LocalModule>) => {
	const { module, selectedInstance, selectInstance } = props;

	return (
		<div className="mb-4">
			<ul>
				{Array.from(module.instances).map(([version, inst]) => (
					<_LocalModuleInstance
						key={version}
						moduleInstance={inst}
						isSelected={inst === selectedInstance}
						selectInstance={selectInstance}
						addModule={props.addModule}
						removeModule={props.removeModule}
						updateModule={props.updateModule}
					/>
				))}
			</ul>
		</div>
	);
};

function cutPrefix(str: string, prefix: string) {
	if (str.startsWith(prefix)) {
		return str.slice(prefix.length);
	}
	return str;
}

const RemoteModuleSection = (props: ModuleSectionProps<RemoteModule>) => {
	const { module, selectedInstance, selectInstance } = props;

	const heritage = module.getHeritage().join("▶");

	return (
		<div className="mb-4">
			<h3
				className="text-lg font-semibold mb-2 overflow-x-auto whitespace-nowrap"
				style={{ scrollbarWidth: "none" }}
			>
				{cutPrefix(heritage, "▶")}
			</h3>
			<ul>
				{Array.from(module.instances).map(([version, inst]) => (
					<_RemoteModuleInstance
						key={version}
						moduleInstance={inst}
						isSelected={inst === selectedInstance}
						selectInstance={selectInstance}
						addModule={props.addModule}
						removeModule={props.removeModule}
						updateModule={props.updateModule}
					/>
				))}
			</ul>
		</div>
	);
};

interface ModuleInstanceProps<I extends MI = MI> {
	moduleInstance: I;
	isSelected: boolean;
	selectInstance: (moduleInstance: MI) => void;
	addModule: (module: LocalModule | RemoteModule) => void;
	removeModule: (module: LocalModule | RemoteModule) => void;
	updateModule: (module: LocalModule | RemoteModule) => void;
}

const _LocalModuleInstance = (props: ModuleInstanceProps<LocalModuleInstance>) => (
	<li
		onClick={() => props.selectInstance(props.moduleInstance)}
		className={classnames(
			"p-2 rounded-md cursor-pointer flex items-center justify-between hover:bg-blue-600 text-white",
			props.isSelected ? "bg-blue-500" : "bg-blue-400",
		)}
	>
		<ScrollableText>
			<span className="font-medium">{props.moduleInstance.getVersion()}</span>
		</ScrollableText>
		<div className="flex items-center gap-2">
			<InsDelButton moduleInstance={props.moduleInstance} updateModule={props.updateModule} />
			<RemoveButton
				moduleInstance={props.moduleInstance}
				removeModule={props.removeModule}
				updateModule={props.updateModule}
			/>
			<EnaDisBtn moduleInstance={props.moduleInstance} updateModule={props.updateModule} />
		</div>
	</li>
);

const _RemoteModuleInstance = (props: ModuleInstanceProps<RemoteModuleInstance>) => (
	<li
		onClick={() => props.selectInstance(props.moduleInstance)}
		className={classnames(
			"p-2 rounded-md cursor-pointer flex items-center justify-between hover:bg-blue-600 text-white",
			props.isSelected ? "bg-blue-500" : "bg-blue-400",
		)}
	>
		<ScrollableText>
			<span className="font-medium">{props.moduleInstance.getVersion()}</span>
		</ScrollableText>
		<div className="flex items-center gap-2">
			<AddButton
				moduleInstance={props.moduleInstance}
				addModule={props.addModule}
			/>
			<EnaDisBtn moduleInstance={props.moduleInstance} updateModule={props.updateModule} />
		</div>
	</li>
);

interface InsDelButtonProps {
	moduleInstance: LocalModuleInstance;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const InsDelButton = (props: InsDelButtonProps) => {
	const Button = props.moduleInstance.isInstalled() ? DeleteButton : InstallButton;

	return Button(props);
};

interface DeleteButtonProps {
	moduleInstance: LocalModuleInstance;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const DeleteButton = (props: DeleteButtonProps) => (
	<button
		onClick={async () => {
			if (await props.moduleInstance.delete()) {
				props.updateModule(props.moduleInstance.getModule());
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-red-500 bg-red-100 rounded hover:bg-red-200"
	>
		del
	</button>
);

interface InstallButtonProps {
	moduleInstance: LocalModuleInstance;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const InstallButton = (props: InstallButtonProps) => (
	<button
		onClick={async () => {
			if (await props.moduleInstance.install()) {
				props.updateModule(props.moduleInstance.getModule());
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-green-500 bg-green-100 rounded hover:bg-green-200"
	>
		ins
	</button>
);

interface RemoveButtonProps {
	moduleInstance: LocalModuleInstance;
	removeModule: (module: LocalModule | RemoteModule) => void;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const RemoveButton = (props: RemoveButtonProps) => (
	<button
		onClick={async () => {
			if (await props.moduleInstance.remove()) {
				const module = props.moduleInstance.getModule();
				if (module.parent) {
					props.updateModule(module);
				} else {
					props.removeModule(module);
				}
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-red-500 bg-red-100 rounded hover:bg-red-200"
	>
		rem
	</button>
);

interface AddButtonProps {
	moduleInstance: RemoteModuleInstance;
	addModule: (module: LocalModule | RemoteModule) => void;
}
const AddButton = (props: AddButtonProps) => (
	<button
		onClick={async () => {
			const localModuleInstance = await props.moduleInstance.add();
			if (localModuleInstance) {
				props.addModule(localModuleInstance.getModule());
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-green-500 bg-green-100 rounded hover:bg-green-200"
	>
		add
	</button>
);

interface EnabledStateButtonProps {
	moduleInstance: MI;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const EnaDisBtn = (props: EnabledStateButtonProps) => {
	const Button = props.moduleInstance.isEnabled() ? DisableButton : EnableButton;

	return Button(props);
};

interface EnaDisButtonProps {
	moduleInstance: MI;
	updateModule: (module: LocalModule | RemoteModule) => void;
}

const DisableButton = (props: EnaDisButtonProps) => (
	<button
		onClick={async () => {
			if (await props.moduleInstance.getModule().disable()) {
				props.updateModule(props.moduleInstance.getModule());
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-yellow-500 bg-yellow-100 rounded hover:bg-yellow-200"
	>
		dis
	</button>
);

const EnableButton = (props: EnaDisButtonProps) => (
	<button
		onClick={async () => {
			if (await props.moduleInstance.enable()) {
				props.updateModule(props.moduleInstance.getModule());
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-blue-500 bg-blue-100 rounded hover:bg-blue-200"
	>
		ena
	</button>
);
