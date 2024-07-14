import { React } from "/modules/stdlib/src/expose/React.ts";
import { MdDeleteSweep, MdAddCircleOutline } from "https://esm.sh/react-icons/md";
import AuthorsDiv from "./AuthorsDiv.tsx";
import TagsDiv from "./TagsDiv.tsx";
import {
	type Metadata,
	type Module,
	type ModuleIdentifier,
	type ModuleInstance,
	RootModule,
} from "/hooks/module.ts";
import { useUpdate } from "../../util/index.ts";
import { Cards, SettingsToggle } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { classnames } from "/modules/stdlib/src/webpack/ClassNames.ts";
import { useQuery } from "/modules/stdlib/src/webpack/ReactQuery.ts";
import { display } from "/modules/stdlib/lib/modal.tsx";
import { RemoteMarkdown } from "../../pages/Module.tsx";

const fallbackImage = () => (
	<svg
		data-encore-id="icon"
		role="img"
		aria-hidden="true"
		data-testid="card-image-fallback"
		viewBox="0 0 24 24"
		className="fill-current"
		style={{ width: "64px", height: "64px" }}
	>
		<path d="M20.929,1.628A1,1,0,0,0,20,1H4a1,1,0,0,0-.929.628l-2,5A1.012,1.012,0,0,0,1,7V22a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V7a1.012,1.012,0,0,0-.071-.372ZM4.677,3H19.323l1.2,3H3.477ZM3,21V8H21V21Zm8-3a1,1,0,0,1-1,1H6a1,1,0,0,1,0-2h4A1,1,0,0,1,11,18Z" />
	</svg>
);

interface ModuleCardProps {
	moduleInstance: ModuleInstance;
	selectModule: (moduleIdentifier: ModuleIdentifier | null) => void;
	isSelected: boolean;
	removeModule: (module: Module) => void;
	updateModule: (module: Module) => void;
	addModule: (module: Module) => void;
	selectInstance: (moduleInstance: ModuleInstance) => void;
}
const ModuleCard = (props: ModuleCardProps) => {
	const { moduleInstance, isSelected } = props;
	const module = moduleInstance.getModule();
	const noMetadata = moduleInstance.metadata === null;

	const metadataURL = moduleInstance.getMetadataURL();
	useQuery({
		queryKey: ["moduleCard", metadataURL],
		queryFn: () =>
			fetch(metadataURL!)
				.then((res) => res.json() as Promise<Metadata>)
				.then((metadata) => moduleInstance.updateMetadata(metadata)),
		enabled: noMetadata && !!metadataURL,
	});

	const {
		name = moduleInstance.getModuleIdentifier(),
		tags = [],
		preview = "./assets/preview.gif",
		authors = [],
		description = moduleInstance.getVersion(),
		readme,
	} = moduleInstance.metadata ?? {};

	const cardClasses = classnames("rounded-lg bg-neutral-900 p-4 transition duration-300 ease-in-out", {
		"border border-dashed border-[var(--essential-warning)]": noMetadata,
		"!bg-neutral-800": isSelected,
	});

	const externalHref = moduleInstance.getRemoteArtifactURL() ?? null;
	const previewHref = metadataURL ? `${metadataURL}/../${preview}` : null;
	const readmeHref = metadataURL ? `${metadataURL}/../${readme}` : null;

	// TODO: add more important tags
	const importantTags: string[] = [];

	const onCardClick = React.useCallback(() => {
		const selectedModule = isSelected ? null : module.getIdentifier();
		props.selectModule(selectedModule);
	}, [isSelected, module, props.selectModule]);

	const onImageClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (readmeHref) {
			display({ title: "Preview", content: <RemoteMarkdown url={readmeHref} />, isLarge: true });
		}
	};

	const localModule = RootModule.INSTANCE.getChild(module.getIdentifier());
	const enabledLocalInstance = localModule?.getEnabledInstance();
	const showLoaded = enabledLocalInstance?.isInstalled() ?? false;

	const isLoaded = React.useCallback(() => moduleInstance.isLoaded(), [moduleInstance]);

	const [loaded, setLoaded, updateLoaded] = useUpdate(isLoaded);

	const onToggleLoaded = async (checked: boolean) => {
		let hasChanged: boolean | undefined;
		if (checked) {
			if (moduleInstance.canLoad()) {
				setLoaded(true);
				hasChanged = await moduleInstance.load();
			}
		} else {
			if (moduleInstance.canUnload()) {
				setLoaded(false);
				hasChanged = await moduleInstance.unload();
			}
		}

		if (hasChanged) {
			props.updateModule(module);
		} else {
			updateLoaded();
		}
	};

	const isEnabled = React.useCallback(() => moduleInstance.isEnabled(), [moduleInstance]);

	const isInstalled = React.useCallback(() => moduleInstance.isInstalled(), [moduleInstance]);

	const isAdded = React.useCallback(() => moduleInstance.isLocal(), [moduleInstance]);

	const enableModule = async () => {
		let hasChanged: boolean | undefined;
		if (module.canEnable(moduleInstance)) {
			hasChanged = await module.enable(moduleInstance);
		}

		if (hasChanged) {
			props.updateModule(moduleInstance.getModule());
		}
	};

	const disableModule = async () => {
		let hasChanged: boolean | undefined;
		if (module.canDisable(moduleInstance)) {
			hasChanged = await module.disable();
		}

		if (hasChanged) {
			props.updateModule(moduleInstance.getModule());
		}
	}

	const installModule = async () => {
		let success: ModuleInstance | null = null;
		if (moduleInstance.canInstallRemove()) {
			success = await moduleInstance.install();
		}

		if (success) {
			props.updateModule(success.getModule());
		}
	};

	const deleteModule = async () => {
		let success: ModuleInstance | null = null;
		if (moduleInstance.canDelete()) {
			success = await moduleInstance.delete();
		}

		if (success) {
			props.updateModule(moduleInstance.getModule());
		}
	};

	const addModuleLocally = async () => {
		let success: ModuleInstance | null = null;

		if (moduleInstance.canAdd()) {
			success = await moduleInstance.add();

			if (success) {
				props.addModule(success.getModule());
				props.selectInstance(success);
			}
		}
	};

	const removeModule = async () => {
		let success: ModuleInstance | null = null;
		if (moduleInstance.canInstallRemove()) {
			success = await moduleInstance.remove();

			if (success) {
				const temp_module = props.moduleInstance.getModule();
				if (temp_module.parent) {
					props.updateModule(temp_module);
				} else {
					props.removeModule(temp_module);
				}
			}
		}

		if (success) {
			props.updateModule(moduleInstance.getModule());
		}
	}

	const full_install = async (install: boolean) => {
		if (install) {
			await addModuleLocally();
			await installModule();
			await enableModule();
		} else {
			await disableModule();
			await deleteModule();
			await removeModule();
		}

		props.updateModule(moduleInstance.getModule());
	};

	const fullInstalled = isEnabled() && isInstalled() && isAdded();

	
	// TODO: implement (add, install, enable) and (disable, delete, remove) buttons
	const buttons = (
		<>
			{showLoaded && SettingsToggle && (
				<SettingsToggle
					className="x-settings-button justify-end"
					value={loaded}
					onSelected={onToggleLoaded}
				/>
			)}
			<button
				className={`cursor-pointer border-0 rounded inline-flex items-center justify-between ${
					fullInstalled ? "bg-gray-500" : "bg-green-500"
				} text-white px-4 py-2`}
				onClick={async () => {

					await full_install(!fullInstalled);
				}}
			>
				{fullInstalled ? (
					<>
						<MdDeleteSweep />
						{"Full Uninstall"}
					</>
				) : (
					<>
						<MdAddCircleOutline />
						{"Full Install"}
					</>
				)}
			</button>
		</>
	);

	return (
		<ModuleCardContent
			className={cardClasses}
			onCardClick={onCardClick}
			onImageClick={onImageClick}
			previewHref={previewHref}
			name={name}
			externalHref={externalHref ?? "ehref"}
			authors={authors}
			description={description}
			tags={tags}
			importantTags={importantTags}
		>
			{buttons}
		</ModuleCardContent>
	);
};

interface ModuleCardContentProps {
	className?: string;
	onCardClick: React.HTMLAttributes<HTMLDivElement>["onClick"];
	previewHref: string | null;
	onImageClick: React.HTMLAttributes<HTMLDivElement>["onClick"];
	name: string;
	externalHref: string;
	authors: string[];
	description: string;
	showTags?: boolean;
	tags: string[];
	importantTags: string[];
	children?: React.ReactNode;
}
const ModuleCardContent = (props: ModuleCardContentProps) => {
	const {
		className,
		onCardClick,
		previewHref,
		onImageClick,
		name,
		externalHref,
		authors,
		description,
		showTags = true,
		tags,
		importantTags,
		children,
	} = props;

	return (
		<div className={className}>
			<div
				className="flex flex-col h-full"
				style={{ pointerEvents: "all" }}
				draggable="true"
				onClick={onCardClick}
			>
				<div
					onClick={onImageClick}
					style={{ pointerEvents: "all", cursor: "pointer", marginBottom: "16px" }}
				>
					<Cards.CardImage
						images={previewHref ? [{ url: previewHref }] : []}
						FallbackComponent={fallbackImage}
					/>
				</div>
				<div className="flex flex-col gap-2 flex-grow">
					<a
						draggable="false"
						title={name}
						className="hover:underline"
						dir="auto"
						href={externalHref}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="main-type-balladBold">{name}</div>
					</a>
					<div className="text-sm mx-0 whitespace-normal color-[var(--text-subdued)] flex flex-col gap-2">
						<AuthorsDiv authors={authors} />
					</div>
					<p className="text-sm mx-0 overflow-hidden line-clamp-3 mb-auto">
						{description || "No description for this package"}
					</p>
					<div className="text-[var(--text-subdued)] whitespace-normal main-type-mestoBold">
						<TagsDiv tags={tags} showTags={showTags} importantTags={importantTags} />
					</div>
					<div className="flex justify-between">{children}</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(ModuleCard);
