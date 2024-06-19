import { React } from "/modules/official/stdlib/src/expose/React.ts";
import AuthorsDiv from "./AuthorsDiv.tsx";
import TagsDiv from "./TagsDiv.tsx";
import {
	LocalModule,
	LocalModuleInstance,
	type Metadata,
	ModuleIdentifier,
	RemoteModule,
	RemoteModuleInstance,
} from "/hooks/module.ts";
import { _ } from "/modules/official/stdlib/deps.ts";
import { useUpdate } from "../../util/index.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { Cards, SettingToggle } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.ts";
import { useQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.ts";
import { MI } from "../../pages/Marketplace.tsx";
import { proxy } from "/hooks/util.ts";

const History = Platform.getHistory();

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
	moduleInstance: MI;
	selectModule: (moduleIdentifier: ModuleIdentifier | null) => void;
	isSelected: boolean;
	updateModule: (module: LocalModule | RemoteModule) => void;
}
const ModuleCard = (props: ModuleCardProps) => {
	const { moduleInstance, isSelected } = props;
	const module = moduleInstance.getModule();

	const isLoaded = React.useCallback(
		() => moduleInstance instanceof LocalModuleInstance && moduleInstance.isLoaded(),
		[moduleInstance],
	);
	const [loaded, setLoaded, updateLoaded] = useUpdate(isLoaded);

	const enabled = moduleInstance.isEnabled();
	const isRemote = moduleInstance instanceof RemoteModuleInstance;
	const installed = !isRemote && moduleInstance.isInstalled();
	const hasRemote = Boolean(moduleInstance.artifacts.length);

	const remoteMetadata = moduleInstance.getRemoteMetadata();
	const { data, isSuccess } = useQuery({
		queryKey: ["moduleCard", remoteMetadata],
		queryFn: () => fetch(...proxy(remoteMetadata!)).then((res) => res.json() as Promise<Metadata>),
		enabled: moduleInstance.metadata === null && hasRemote,
	});

	if (moduleInstance.metadata === null && isSuccess) {
		moduleInstance.updateMetadata(data);
	}

	const {
		name = moduleInstance.getModuleIdentifier(),
		description = moduleInstance.getVersion(),
		tags = ["available"],
		authors = [],
		preview = "./assets/preview.gif",
	} = moduleInstance.metadata ?? {};

	const cardClasses = classnames("LunqxlFIupJw_Dkx6mNx", {
		"border border-dashed border-[var(--essential-warning)]": isRemote,
		"bg-neutral-800": isSelected,
	});

	const externalHref = moduleInstance.getRemoteArtifact();
	const metadataURL = installed ? moduleInstance.getRelPath("metadata.json") : remoteMetadata;
	const previewHref = metadataURL ? `${metadataURL}/../${preview}` : "";

	// TODO: add more important tags
	const importantTags = [].filter(Boolean);

	const onCardClick = React.useCallback(() => {
		const selectedModule = isSelected ? null : module.getIdentifier();
		props.selectModule(selectedModule);
	}, [isSelected, module, props.selectModule]);

	const onImageClick = () =>
		metadataURL && History.push(`/bespoke/marketplace/${encodeURIComponent(metadataURL)}`);

	const onToggleLoaded = async (checked: boolean) => {
		if (!(moduleInstance instanceof LocalModuleInstance)) {
			return;
		}
		setLoaded(checked);
		const hasChanged = checked ? moduleInstance.load() : moduleInstance.unload();
		if (await hasChanged) {
			props.updateModule(module);
		} else {
			updateLoaded();
		}
	};

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
			installed={installed}
			enabled={enabled}
			loaded={loaded}
			onToggleLoaded={onToggleLoaded}
		/>
	);
};

interface ModuleCardContentProps {
	className?: string;
	onCardClick: () => void;
	onImageClick: () => void;
	previewHref: string;
	name: string;
	externalHref: string;
	authors: string[];
	description: string;
	tags: string[];
	showTags?: boolean;
	importantTags: string[];
	installed: boolean;
	enabled: boolean;
	loaded: boolean;
	onToggleLoaded: (checked: boolean) => void;
}
const ModuleCardContent = (props: ModuleCardContentProps) => {
	const {
		className,
		onCardClick,
		onImageClick,
		previewHref,
		name,
		externalHref,
		authors,
		description,
		tags,
		showTags = true,
		importantTags,
		installed,
		enabled,
		loaded,
		onToggleLoaded,
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
						images={[{ url: previewHref }]}
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
						<TagsDiv
							tags={tags}
							showTags={showTags}
							importantTags={importantTags}
						/>
					</div>
					<div className="flex justify-between">
						{installed && enabled && SettingToggle && (
							<SettingToggle
								className="x-settings-button justify-end"
								value={loaded}
								onSelected={onToggleLoaded}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(ModuleCard);
