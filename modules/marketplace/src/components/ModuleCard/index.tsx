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

	const fastDelete = async () => {
		const module = moduleInstance.getModule();

		dis: if (moduleInstance.isEnabled()) {
			if (module.canDisable(moduleInstance)) {
				if (await module.disable()) {
					props.updateModule(module);
					break dis;
				}
			}
			return false;
		}

		del: if (moduleInstance.isInstalled()) {
			if (moduleInstance.canDelete()) {
				if (await moduleInstance.delete()) {
					props.updateModule(module);
					break del;
				}
			}
			return false;
		}

		rem: if (moduleInstance.isLocal()) {
			if (moduleInstance.canInstallRemove()) {
				if (await moduleInstance.remove()) {
					if (module.parent) {
						props.updateModule(module);
					} else {
						props.removeModule(module);
					}
					break rem;
				}
			}
			return false;
		}
		return true;
	};
	const fastInstall = async () => {
		let localModuleInstance = moduleInstance;
		let localModule = localModuleInstance.getModule();

		add: if (!moduleInstance.isLocal()) {
			if (moduleInstance.canAdd()) {
				localModuleInstance = await moduleInstance.add();
				if (localModuleInstance) {
					localModule = localModuleInstance.getModule();
					props.addModule(localModule);
					props.selectInstance(localModuleInstance);
					break add;
				}
			}
			return false;
		}

		ins: if (!localModuleInstance.isInstalled()) {
			if (localModuleInstance.canInstallRemove()) {
				if (await localModuleInstance.install()) {
					props.updateModule(localModule);
					break ins;
				}
			}
			return false;
		}

		ena: if (!localModuleInstance.isEnabled()) {
			if (localModule.canEnable(localModuleInstance)) {
				if (await localModule.enable(localModuleInstance)) {
					props.updateModule(localModule);
					break ena;
				}
			}
			return false;
		}
		return true;
	};

	const isInstalled = moduleInstance.isInstalled();
	const fastInstallDeleteButton = isInstalled ? (
		<>
			<MdDeleteSweep />
			Reset
		</>
	) : (
		<>
			<MdAddCircleOutline />
			Install
		</>
	);

	const footer = (
		<div className="flex justify-between w-full">
			{showLoaded && SettingsToggle && (
				<SettingsToggle
					className="x-settings-button justify-end"
					value={loaded}
					onSelected={onToggleLoaded}
				/>
			)}
			<button
				className={`cursor-pointer border-0 rounded inline-flex items-center justify-between ${
					isInstalled ? "bg-gray-500" : "bg-green-500"
				} text-white px-2 py-2 w-1/2 h-8`}
				onClick={async () => {
					if (isInstalled) {
						await fastDelete();
					} else {
						await fastInstall();
					}
				}}
			>
				{fastInstallDeleteButton}
			</button>
		</div>
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
			{footer}
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
