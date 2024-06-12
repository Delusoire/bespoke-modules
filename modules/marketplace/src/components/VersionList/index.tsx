import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.ts";
import { MI } from "../../pages/Marketplace.tsx";
import { useUpdate } from "../../util/index.ts";
import { LocalModuleInstance } from "/hooks/module.ts";
import { RemoteModuleInstance } from "/hooks/module.ts";
import { type Module } from "/hooks/module.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { useLocation, usePanelAPI } from "/modules/official/stdlib/src/webpack/CustomHooks.ts";
import {
	PanelContent,
	PanelHeader,
	PanelSkeleton,
} from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { ScrollableText } from "/modules/official/stdlib/src/webpack/ReactComponents.js";

export interface VersionListProps {}
export default function (props: VersionListProps) {
	const [ref, setRef] = React.useState<HTMLDivElement | null>(null);

	const m = React.useMemo(() => import("../../pages/Marketplace.js"), []);

	React.useEffect(() => void m.then((m) => m.refresh?.()), [ref]);
	React.useEffect(() => () => void m.then((m) => m.unselect?.()), []);

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
	modules: Array<Module<Module<any>>>;
	selectedInstance: MI;
	selectInstance: (moduleInstance: MI) => void;
}
export const VersionListPanel = React.memo((props: VersionListPanelProps) => (
	<>
		<PanelHeader title={props.selectedInstance.getModuleIdentifier()} />
		<VersionListContent {...props} />
	</>
));

const VersionListContent = (props: VersionListPanelProps) => {
	const [, rerender] = React.useReducer((x) => x + 1, 0);

	return (
		<div className="p-4 flex flex-col rounded-lg shadow-md">
			{props.modules.map((module) => (
				<ModuleSection
					key={module.getHeritage().join("\x00")}
					module={module}
					selectedInstance={props.selectedInstance}
					selectInstance={props.selectInstance}
					rerenderPanel={rerender}
				/>
			))}
		</div>
	);
};

interface ModuleSectionProps {
	module: Module<Module<any>>;
	selectedInstance: MI;
	selectInstance: (moduleInstance: MI) => void;
	rerenderPanel: () => void;
}
const ModuleSection = (props: ModuleSectionProps) => {
	const { module, selectedInstance, selectInstance, rerenderPanel } = props;

	const heritage = module.getHeritage().join("▶");
	const [, rerender] = React.useReducer((x) => x + 1, 0);

	return (
		<div className="mb-4">
			<h3 className="text-lg font-semibold mb-2 overflow-x-auto whitespace-nowrap">{heritage}</h3>
			<ul>
				{Array.from(module.instances).map(([version, inst]) => (
					<ModuleInstance
						key={version}
						moduleInstance={inst as MI}
						isSelected={inst === selectedInstance}
						selectInstance={selectInstance}
						rerenderSection={rerender}
						rerenderPanel={rerenderPanel}
					/>
				))}
			</ul>
		</div>
	);
};

interface VersionProps {
	moduleInstance: MI;
	isSelected: boolean;
	selectInstance: (moduleInstance: MI) => void;
	rerenderSection: () => void;
	rerenderPanel: () => void;
}
const ModuleInstance = (props: VersionProps) => (
	<li
		onClick={() => props.selectInstance(props.moduleInstance)}
		className={classnames(
			"p-2 rounded-md cursor-pointer flex items-center justify-between",
			props.isSelected ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200",
		)}
	>
		<ScrollableText>
			<span className="font-medium">{props.moduleInstance.getVersion()}</span>
		</ScrollableText>
		<ModuleInstanceButtons
			moduleInstance={props.moduleInstance}
			rerenderSection={props.rerenderSection}
			rerenderPanel={props.rerenderPanel}
		/>
	</li>
);

interface ModuleInstanceButtonsProps {
	moduleInstance: MI;
	rerenderSection: () => void;
	rerenderPanel: () => void;
}
const ModuleInstanceButtons = (props: ModuleInstanceButtonsProps) => {
	const { moduleInstance, rerenderSection, rerenderPanel } = props;
	return (
		<div className="flex items-center gap-2">
			{moduleInstance instanceof LocalModuleInstance &&
				(
					<LocalModuleInstanceButtons
						moduleInstance={moduleInstance}
						rerenderSection={rerenderSection}
					/>
				)}
			{moduleInstance instanceof RemoteModuleInstance &&
				<RemoteModuleInstanceButtons moduleInstance={moduleInstance} rerenderPanel={rerenderPanel} />}
			<EnaDisBtn moduleInstance={moduleInstance} />
		</div>
	);
};

interface LocalModuleInstanceButtonsProps {
	moduleInstance: LocalModuleInstance;
	rerenderSection: () => void;
}
const LocalModuleInstanceButtons = (props: LocalModuleInstanceButtonsProps) => {
	return (
		<>
			<InsDelButton moduleInstance={props.moduleInstance} rerenderSection={props.rerenderSection} />
			<RemoveButton moduleInstance={props.moduleInstance} rerenderSection={props.rerenderSection} />
		</>
	);
};

interface RemoteModuleInstanceButtonsProps {
	moduleInstance: RemoteModuleInstance;
	rerenderPanel: () => void;
}
const RemoteModuleInstanceButtons = (props: RemoteModuleInstanceButtonsProps) => (
	<AddButton
		moduleInstance={props.moduleInstance}
		rerenderPanel={props.rerenderPanel}
	/>
);

interface InsDelButtonProps {
	moduleInstance: LocalModuleInstance;
	rerenderSection: () => void;
}
const InsDelButton = (props: InsDelButtonProps) => {
	const isInstalled = React.useCallback(() => props.moduleInstance.isInstalled(), [props.moduleInstance]);
	const [installed, setInstalled, updateInstalled] = useUpdate(isInstalled);

	const Button = installed ? DeleteButton : InstallButton;

	return <Button {...props} setInstalled={setInstalled} updateInstalled={updateInstalled} />;
};

interface DeleteButtonProps {
	moduleInstance: LocalModuleInstance;
	setInstalled: (installed: boolean) => void;
	updateInstalled: () => void;
}
const DeleteButton = (props: DeleteButtonProps) => (
	<button
		onClick={async () => {
			props.setInstalled(false);
			if (!(await props.moduleInstance.delete())) {
				props.updateInstalled();
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-red-500 bg-red-100 rounded hover:bg-red-200"
	>
		del
	</button>
);

interface InstallButtonProps {
	moduleInstance: LocalModuleInstance;
	setInstalled: (installed: boolean) => void;
	updateInstalled: () => void;
}
const InstallButton = (props: InstallButtonProps) => (
	<button
		onClick={async () => {
			props.setInstalled(true);
			if (await props.moduleInstance.install()) {
				props.updateInstalled();
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-green-500 bg-green-100 rounded hover:bg-green-200"
	>
		ins
	</button>
);

interface RemoveButtonProps {
	moduleInstance: LocalModuleInstance;
	rerenderSection: () => void;
}
const RemoveButton = (props: RemoveButtonProps) => (
	<button
		onClick={async () => {
			if (await props.moduleInstance.remove()) {
				props.rerenderSection();
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-red-500 bg-red-100 rounded hover:bg-red-200"
	>
		rem
	</button>
);

interface AddButtonProps {
	moduleInstance: RemoteModuleInstance;
	rerenderPanel: () => void;
}
const AddButton = (props: AddButtonProps) => (
	<button
		onClick={async () => {
			if (await props.moduleInstance.add()) {
				props.rerenderPanel();
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-green-500 bg-green-100 rounded hover:bg-green-200"
	>
		add
	</button>
);

interface EnabledStateButtonProps {
	moduleInstance: MI;
}
const EnaDisBtn = (props: EnabledStateButtonProps) => {
	const isEnabled = React.useCallback(() => props.moduleInstance.isEnabled(), [props.moduleInstance]);
	const [enabled, setEnabled, updateEnabled] = useUpdate(isEnabled);
	const Button = enabled ? DisableButton : EnableButton;

	return (
		<Button
			{...props}
			setEnabled={(enabled: boolean) => setEnabled(enabled)}
			updateEnabled={updateEnabled}
		/>
	);
};

interface EnaDisButtonProps {
	moduleInstance: MI;
	setEnabled: (installed: boolean) => void;
	updateEnabled: () => void;
}

const DisableButton = (props: EnaDisButtonProps) => (
	<button
		onClick={async () => {
			props.setEnabled(false);
			if (!(await props.moduleInstance.getModule().disable())) {
				props.updateEnabled();
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
			props.setEnabled(true);
			if (!(await props.moduleInstance.enable())) {
				props.updateEnabled();
			}
		}}
		className="px-2 py-1 text-xs font-semibold text-blue-500 bg-blue-100 rounded hover:bg-blue-200"
	>
		ena
	</button>
);
