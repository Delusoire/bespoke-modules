import { React } from "/modules/official/stdlib/src/expose/React.ts";
import AuthorsDiv from "./AuthorsDiv.tsx";
import TagsDiv from "./TagsDiv.tsx";
import type { Metadata, Module } from "/hooks/module.ts";
import { _, startCase } from "/modules/official/stdlib/deps.ts";
import { useUpdate } from "../../util/index.ts";
import { fetchJSON } from "/hooks/util.ts";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";
import { Cards, SettingToggle } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.ts";
import { useQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.ts";
import { VersionListPanel } from "../VersionList/index.tsx";
import { ReactDOM } from "/modules/official/stdlib/src/webpack/React.ts";
import { MI } from "../../pages/Marketplace.tsx";

const History = Platform.getHistory();

interface ModuleCardProps {
	modules: Array<Module<Module<any>>>;
	moduleInstance: MI;
	selectInstance: (v: MI) => void;
	showTags?: boolean;
	onClick: () => void;
	isSelected: boolean;
}

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

export default function (
	props: ModuleCardProps,
) {
	const { modules, moduleInstance: inst, selectInstance, showTags = true, onClick, isSelected } = props;

	const isEnabled = React.useCallback(() => "isLoaded" in inst && inst.isLoaded(), [inst]);
	const [enabled, setEnabled, updateEnabled] = useUpdate(isEnabled);

	const installed = "isInstalled" in inst && inst.isInstalled();
	const hasRemote = Boolean(inst.artifacts.length);

	const outdated = installed && hasRemote && false;

	const remoteMetadata = inst.getRemoteMetadata();
	const { data, isSuccess } = useQuery({
		queryKey: ["moduleCard", remoteMetadata],
		queryFn: () => fetchJSON<Metadata>(remoteMetadata!),
		enabled: inst.metadata === null && hasRemote,
	});

	if (inst.metadata === null && isSuccess) {
		inst.updateMetadata(data);
	}

	const {
		name = inst.getModuleIdentifier(),
		description = inst.getVersion(),
		tags = ["available"],
		authors = [],
		preview = "./assets/preview.gif",
	} = inst.metadata ?? {};

	const cardClasses = classnames("LunqxlFIupJw_Dkx6mNx", {
		"border-[var(--essential-warning)]": outdated,
		"bg-neutral-800": isSelected,
	});

	const externalHref = inst.getRemoteArtifact();
	const metadataURL = installed ? inst.getRelPath("metadata.json") : remoteMetadata;
	const previewHref = metadataURL ? `${metadataURL}/../${preview}` : "";

	// TODO: add more important tags
	const importantTags = [].filter(Boolean);

	const panelTarget: any = document.querySelector("#MarketplacePanel");
	let panel;
	if (isSelected && panelTarget) {
		panel = ReactDOM.createPortal(
			<VersionListPanel
				modules={modules}
				selectedInstance={inst}
				selectInstance={selectInstance}
			/>,
			panelTarget,
		);
	}

	return (
		<div className={cardClasses}>
			{panel}
			<div
				className="border-[var(--essential-warning)] flex flex-col h-full"
				style={{ pointerEvents: "all" }}
				draggable="true"
				onClick={onClick}
			>
				<div
					onClick={() => {
						metadataURL && History.push(`/bespoke/marketplace/${encodeURIComponent(metadataURL)}`);
					}}
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
						<div className="main-type-balladBold">{startCase(name)}</div>
					</a>
					<div className="text-sm mx-0 whitespace-normal color-[var(--spice-subtext)] flex flex-col gap-2">
						<AuthorsDiv authors={authors} />
					</div>
					<p className="text-sm mx-0 overflow-hidden line-clamp-3 mb-auto">
						{description || "No description for this package"}
					</p>
					<div className="text-[var(--spice-subtext)] whitespace-normal main-type-mestoBold">
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
								value={enabled}
								onSelected={async (checked: boolean) => {
									setEnabled(checked);
									const hasChanged = checked ? inst.load() : inst.unload();
									if (!(await hasChanged)) {
										updateEnabled();
									}
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
