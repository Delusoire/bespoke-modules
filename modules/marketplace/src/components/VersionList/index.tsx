import { classnames } from "/modules/stdlib/src/webpack/ClassNames.ts";
import { MI } from "../../pages/Marketplace.tsx";
import { useUpdate } from "../../util/index.ts";
import { LocalModule, LocalModuleInstance, ModuleIdentifier, RemoteModule } from "/hooks/module.ts";
import { RemoteModuleInstance } from "/hooks/module.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { useLocation, usePanelAPI } from "/modules/stdlib/src/webpack/CustomHooks.ts";
import {
	PanelContent,
	PanelHeader,
	PanelSkeleton,
} from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { ScrollableText } from "/modules/stdlib/src/webpack/ReactComponents.js";
import {
	MdCircle,
	MdCloudDownload,
	MdDelete,
	MdDeleteForever,
	MdInstallDesktop,
	MdOutlineCircle,
} from "https://esm.sh/react-icons/md";
import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.ts";
import { useModules } from "../ModulesProvider/index.tsx";

export default function () {
	const location = useLocation();
	const { panelSend } = usePanelAPI();
	if (location.pathname !== "/bespoke/marketplace") {
		panelSend("panel_close_click_or_collapse");
	}

	return (
		<PanelSkeleton label="Marketplace">
			<PanelContent>
				<VersionListPanelContent />
			</PanelContent>
		</PanelSkeleton>
	);
}

const VersionListPanelContent = React.memo(() => {
	const m = useModules();
	const modules = m.modules[m.selectedModule!] ?? [];
	const selectedInstance = m.moduleToInstance[m.selectedModule!] ?? null;

	if (!selectedInstance) {
		return (
			<>
				<PanelHeader title="No module selected" />
				Select a module to view its versions.
			</>
		);
	}

	return (
		<>
			<PanelHeader title={selectedInstance.getModuleIdentifier()} />
			<div className="flex flex-col gap-4">
				{modules.map((module) => (
					<ModuleSection
						key={module.getHeritage().join("\x00")}
						module={module}
						addModule={m.addModule}
						removeModule={m.removeModule}
						updateModule={m.updateModule}
						selectedInstance={selectedInstance!}
						selectInstance={m.selectInstance}
					/>
				))}
			</div>
		</>
	);
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
		<div className="bg-[var(--background-tinted-base)] rounded-lg px-4 pt-2">
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
		<div className="flex flex-col bg-[var(--background-tinted-base)] rounded-lg px-4 pt-4 gap-2">
			<UI.Text as="div" variant="bodyMediumBold" semanticColor="textBase">
				<div className="overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: "none" }}>
					{cutPrefix(heritage, "▶")}
				</div>
			</UI.Text>
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

const _LocalModuleInstance = (props: ModuleInstanceProps<LocalModuleInstance>) => {
	const { moduleInstance } = props;

	return (
		<div
			onClick={() => props.selectInstance(props.moduleInstance)}
			style={{}}
			className={classnames(
				"flex items-center gap-2 justify-between group",
				"rounded-md -mx-2 mt-0 mb-2 p-2 hover:bg-[var(--background-tinted-highlight)]",
				props.isSelected && "!bg-white !bg-opacity-30",
			)}
		>
			<div className="flex items-center">
				<EnabledDisabledRad moduleInstance={props.moduleInstance} updateModule={props.updateModule} />
			</div>
			<div className="flex-1 min-w-0">
				<ScrollableText>
					<span className="font-medium">{props.moduleInstance.getVersion()}</span>
				</ScrollableText>
			</div>
			{moduleInstance.canInstallRemove() && (
				<>
					<InstallButton moduleInstance={props.moduleInstance} updateModule={props.updateModule} />
					<RemoveButton
						moduleInstance={props.moduleInstance}
						removeModule={props.removeModule}
						updateModule={props.updateModule}
					/>
				</>
			)}
			{moduleInstance.canDelete() && (
				<DeleteButton moduleInstance={props.moduleInstance} updateModule={props.updateModule} />
			)}
		</div>
	);
};

const _RemoteModuleInstance = (props: ModuleInstanceProps<RemoteModuleInstance>) => {
	return (
		<div
			className={classnames(
				"flex items-center gap-2 justify-between group",
				"rounded-md -mx-2 mt-0 mb-2 p-2 hover:bg-[var(--background-tinted-highlight)]",
				props.isSelected && "!bg-white !bg-opacity-30",
			)}
			onClick={() => props.selectInstance(props.moduleInstance)}
		>
			<div className="flex items-center">
				<EnabledDisabledRad moduleInstance={props.moduleInstance} updateModule={props.updateModule} />
			</div>
			<div className="flex-1 min-w-0">
				<ScrollableText>
					<span className="font-medium">{props.moduleInstance.getVersion()}</span>
				</ScrollableText>
			</div>
			<AddButton
				moduleInstance={props.moduleInstance}
				addModule={props.addModule}
			/>
		</div>
	);
};

interface DeleteButtonProps {
	moduleInstance: LocalModuleInstance;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const DeleteButton = (props: DeleteButtonProps) => (
	<button
		className="bg-transparent cursor-pointer border-0 rounded inline-flex items-center"
		onClick={async () => {
			if (await props.moduleInstance.delete()) {
				props.updateModule(props.moduleInstance.getModule());
			}
		}}
	>
		<MdDelete title="Delete" className="w-4 h-4 fill-red-500" />
	</button>
);

interface InstallButtonProps {
	moduleInstance: LocalModuleInstance;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const InstallButton = (props: InstallButtonProps) => (
	<button
		className="bg-transparent cursor-pointer border-0 rounded inline-flex items-center"
		onClick={async () => {
			if (await props.moduleInstance.install()) {
				props.updateModule(props.moduleInstance.getModule());
			}
		}}
	>
		<MdInstallDesktop title="Install" className="w-4 h-4 fill-green-500" />
	</button>
);

interface RemoveButtonProps {
	moduleInstance: LocalModuleInstance;
	removeModule: (module: LocalModule | RemoteModule) => void;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const RemoveButton = (props: RemoveButtonProps) => (
	<button
		className="bg-transparent cursor-pointer border-0 rounded inline-flex items-center"
		onClick={async () => {
			if (await props.moduleInstance.remove()) {
				const module = props.moduleInstance.getModule();
				if (module.parent) {
					props.updateModule(module);
				} else {
					props.removeModule(module);
				}
				props.updateModule(module);
			}
		}}
	>
		<MdDeleteForever title="Remove" className="w-4 h-4 fill-red-500" />
	</button>
);

interface AddButtonProps {
	moduleInstance: RemoteModuleInstance;
	addModule: (module: LocalModule | RemoteModule) => void;
}
const AddButton = (props: AddButtonProps) => (
	<button
		className="bg-transparent cursor-pointer border-0 rounded inline-flex items-center"
		onClick={async () => {
			const localModuleInstance = await props.moduleInstance.add();
			if (localModuleInstance) {
				props.addModule(localModuleInstance.getModule());
			}
		}}
	>
		<MdCloudDownload title="Add" className="w-4 h-4 fill-green-500" />
	</button>
);

interface EnaDisRadioProps {
	moduleInstance: MI;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const EnabledDisabledRad = (props: EnaDisRadioProps) => {
	const getIsEnabled = () => props.moduleInstance.isEnabled();
	const [isEnabled, setEnabled, updateEnabled] = useUpdate(getIsEnabled);

	const enabledDisabledButtonProps = { ...props, setEnabled, updateEnabled };

	return isEnabled ? EnabledButton(enabledDisabledButtonProps) : DisabledButton(enabledDisabledButtonProps);
};

interface EnabledDisabledButtonProps {
	moduleInstance: MI;
	updateModule: (module: LocalModule | RemoteModule) => void;
	setEnabled: (enabled: boolean) => void;
	updateEnabled: () => void;
}

const EnabledButton = (props: EnabledDisabledButtonProps) => {
	return (
		<button
			className="bg-transparent cursor-pointer border-0 rounded inline-flex items-center"
			onClick={async () => {
				props.setEnabled(false);
				if (await props.moduleInstance.getModule().disable()) {
					props.updateModule(props.moduleInstance.getModule());
					props.updateEnabled();
				}
			}}
		>
			<MdCircle title="Enabled" className="w-4 h-4 fill-green-500" />
		</button>
	);
};

const DisabledButton = (props: EnabledDisabledButtonProps) => {
	return (
		<button
			className="bg-transparent cursor-pointer border-0 rounded inline-flex items-center opacity-0 group-hover:opacity-100"
			onClick={async () => {
				props.setEnabled(true);
				const moduleInstance = props.moduleInstance;
				const module = moduleInstance.getModule() as any;
				if (await module.enable(moduleInstance)) {
					props.updateModule(module);
					props.updateEnabled();
				}
			}}
		>
			<MdOutlineCircle title="Disabled" className="w-4 h-4 fill-red-500" />
		</button>
	);
};
