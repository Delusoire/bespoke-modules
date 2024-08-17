import { React } from "/modules/stdlib/src/expose/React.ts";
import { MdDeleteForever, MdInstallDesktop } from "https://esm.sh/react-icons/md";
import AuthorsDiv from "./AuthorsDiv.tsx";
import TagsDiv from "./TagsDiv.tsx";
import { type Metadata, type Module, type ModuleIdentifier, type ModuleInstance } from "/hooks/module.ts";
import { useUpdate } from "../../util/index.ts";
import { Cards, SettingsToggle } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { classnames } from "/modules/stdlib/src/webpack/ClassNames.ts";
import { useQuery } from "/modules/stdlib/src/webpack/ReactQuery.ts";
import { display } from "/modules/stdlib/lib/modal.tsx";
import { RemoteMarkdown } from "../../pages/Module.tsx";
import {
	flattenDTrees,
	getInstanceDTreeCandidates,
	getStaticDeps,
} from "../../util/getModulesVersionsObjectsCandidates.ts";
import { Snackbar } from "/modules/stdlib/src/expose/Snackbar.ts";

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

interface useManageModulesProps {
	updateModules: () => void;
	updateModule: (module: Module) => void;
	removeModule: (module: Module) => void;
	addModule: (module: Module) => void;
	selectInstance: (moduleInstance: ModuleInstance) => void;
}
const useManageModules = (props: useManageModulesProps) => {
	const fastRemove = async (moduleInstance: ModuleInstance) => {
		if (!moduleInstance.isLocal()) {
			return true;
		}

		const module = moduleInstance.getModule();

		if (await moduleInstance.fastRemove()) {
			props.updateModule(module);
			return true;
		}

		Snackbar.enqueueSnackbar(
			`Failed to remove ${moduleInstance.getIdentifier()}`,
			{ variant: "error" },
		);
		return false;
	};

	const fastEnable = async (moduleInstance: ModuleInstance) => {
		if (moduleInstance.isEnabled()) {
			return true;
		}

		const module = moduleInstance.getModule();

		if (await module.fastEnable(moduleInstance)) {
			props.selectInstance(moduleInstance);
			props.updateModule(module);
			return true;
		}

		Snackbar.enqueueSnackbar(
			`Failed to enable ${moduleInstance.getIdentifier()}`,
			{ variant: "error" },
		);
		return false;
	};

	const fastEnableWithDependencies = async (moduleInstance: ModuleInstance) => {
		if (moduleInstance.isEnabled()) {
			return true;
		}

		const deps = getStaticDeps();

		for await (const candidate of getInstanceDTreeCandidates(moduleInstance, deps)) {
			for (const moduleInstance of flattenDTrees(candidate)) {
				if (!await fastEnable(moduleInstance)) {
					return false;
				}
			}
			return true;
		}

		Snackbar.enqueueSnackbar(
			`Failed to enable ${moduleInstance.getIdentifier()}: required dependencies weren't met`,
			{ variant: "error" },
		);
		return false;
	};

	return { fastRemove, fastEnable, fastEnableWithDependencies };
};

interface ModuleCardProps {
	modules: [Module];
	moduleInstance: ModuleInstance;
	selectModules: React.Dispatch<React.SetStateAction<ModuleIdentifier[]>>;
	isSelected: boolean;
	removeModule: (module: Module) => void;
	updateModules: () => void;
	updateModule: (module: Module) => void;
	addModule: (module: Module) => void;
	selectInstance: (moduleInstance: ModuleInstance) => void;
}
const ModuleCard = (props: ModuleCardProps) => {
	const { moduleInstance, isSelected } = props;

	const [module] = props.modules;

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
		preview,
		authors = [],
		description = moduleInstance.getVersion(),
		readme,
	} = moduleInstance.metadata ?? {};

	const cardClasses = classnames(
		"rounded-lg bg-neutral-900 p-4 transition duration-300 ease-in-out",
		{
			"border border-dashed border-[var(--essential-warning)]": noMetadata,
			"!bg-neutral-800": isSelected,
		},
	);

	function parseUrl(url: string | undefined): string | null {
		if (url) {
			if (url.startsWith("/")) {
				return url;
			}
			if (url.startsWith("http://") || url.startsWith("https://")) {
				return url;
			}
			if (url.startsWith("data:")) {
				return url;
			}
			if (metadataURL && url.startsWith("./")) {
				return `${metadataURL}/../${url}`;
			}
		}
		return null;
	}

	const externalHref = moduleInstance.getRemoteArtifactURL() ?? null;
	const previewHref = parseUrl(preview);
	const readmeHref = parseUrl(readme);

	// TODO: add more important tags
	const importantTags: string[] = [];

	const onCardClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (e.shiftKey) {
			// TODO: add shift select (would require to be passed as prop from Marketplace)
		} else if (e.ctrlKey) {
			props.selectModules((selectedModules) => {
				const s = new Set(selectedModules);
				if (s.has(module.getIdentifier())) {
					s.delete(module.getIdentifier());
					return Array.from(s);
				} else {
					return selectedModules.concat([module.getIdentifier()]);
				}
			});
		} else {
			if (isSelected) {
				props.selectModules([]);
			} else {
				props.selectModules([module.getIdentifier()]);
			}
		}
	}, [isSelected, module]);

	const onImageClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (readmeHref) {
			display({
				title: "Preview",
				content: <RemoteMarkdown url={readmeHref} />,
				isLarge: true,
			});
		}
	};

	const enabledLocalInstance = module.getEnabledInstance();
	const showLoaded = enabledLocalInstance?.isInstalled() ?? false;

	const isLoaded = React.useCallback(() => moduleInstance.isLoaded(), [
		moduleInstance,
	]);

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

	const isInstalled = moduleInstance.isInstalled();
	const fastInstallDeleteButton = isInstalled
		? (
			<>
				<MdDeleteForever title="Disable, Delete, and Remove" className="w-4 h-4" />
				Remove
			</>
		)
		: (
			<>
				<MdInstallDesktop title="Add, Install, and Enable" className="w-4 h-4" />
				Enable
			</>
		);

	const { fastRemove, fastEnableWithDependencies } = useManageModules(props);

	const footer = (
		<div className="flex justify-between w-full">
			<button
				className={`cursor-pointer border-0 rounded inline-flex items-center justify-between ${
					isInstalled ? "bg-gray-500" : "bg-green-500"
				} text-white px-2 py-2 h-8`}
				onClick={async (e) => {
					e.stopPropagation();
					if (isInstalled) {
						await fastRemove(moduleInstance);
					} else {
						await fastEnableWithDependencies(moduleInstance);
					}
				}}
			>
				{fastInstallDeleteButton}
			</button>
			{showLoaded && SettingsToggle && (
				<SettingsToggle
					className="x-settings-button justify-end"
					value={loaded}
					onSelected={onToggleLoaded}
				/>
			)}
		</div>
	);

	return (
		<ModuleCardContent
			className={cardClasses}
			onCardClick={onCardClick}
			onImageClick={onImageClick}
			previewHref={previewHref}
			name={name}
			externalHref={externalHref}
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
	onCardClick: React.MouseEventHandler<HTMLDivElement>;
	previewHref: string | null;
	onImageClick: React.MouseEventHandler<HTMLDivElement>;
	name: string;
	externalHref: string | null;
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
					style={{
						pointerEvents: "all",
						cursor: "pointer",
						marginBottom: "16px",
					}}
				>
					<Cards.CardImage
						key={previewHref}
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
						href={externalHref ?? ""}
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
						<TagsDiv
							tags={tags}
							showTags={showTags}
							importantTags={importantTags}
						/>
					</div>
					<div className="flex justify-between">{children}</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(ModuleCard);
