import { MdCloudDownload, MdDeleteForever } from "https://esm.sh/react-icons/md";
import { logger, module as marketplaceModuleInstance } from "../../mod.tsx";
import { renderMarkdown } from "../api/github.ts";
import Button from "../components/Button/index.tsx";
import LoadingIcon from "../components/icons/LoadingIcon.tsx";
import { t } from "../i18n.ts";
import {
	LocalModuleInstance,
	type Metadata,
	ModuleIdentifier,
	RemoteModuleInstance,
	RootModule,
	Version,
} from "/hooks/module.ts";
import { proxy } from "/hooks/util.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { ReactDOM } from "/modules/official/stdlib/src/webpack/React.ts";
import { useQuery, useSuspenseQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.ts";
import { useMatch } from "/modules/official/stdlib/src/webpack/ReactRouter.ts";

interface ShadowRootProps {
	mode: "open" | "closed";
	delegatesFocus: boolean;
	styleSheets: CSSStyleSheet[];
	children: React.ReactNode;
}
const ShadowRoot = ({ mode, delegatesFocus, styleSheets, children }: ShadowRootProps) => {
	const node = React.useRef<HTMLDivElement>(null);
	const [root, setRoot] = React.useState<ShadowRoot>(null!);

	React.useLayoutEffect(() => {
		if (node.current) {
			const root = node.current.attachShadow({
				mode,
				delegatesFocus,
			});
			if (styleSheets.length > 0) {
				root.adoptedStyleSheets = styleSheets;
			}
			setRoot(root);
		}
	}, [node, styleSheets]);

	const content = root && ReactDOM.createPortal(children, root);

	return <div ref={node}>{content}</div>;
};

export const RemoteMarkdown = React.memo(({ url }: { url: string }) => {
	const {
		status,
		error,
		data: markdown,
	} = useQuery({
		queryKey: ["markdown", url],
		queryFn: () => {
			const proxiedUrl = url.startsWith("/") ? url : proxy(url)[0];
			return fetch(proxiedUrl)
				.then((res) => res.text())
				.then((markdown) => renderMarkdown(markdown));
		},
	});

	const fixRelativeImports = (markdown: string) => markdown.replace(/(src|href)="\.\//g, `$1="${url}/../`);

	switch (status) {
		case "pending": {
			return (
				<footer className="m-auto text-center">
					<LoadingIcon />
				</footer>
			);
		}
		case "success": {
			return (
				<ShadowRoot mode="open" delegatesFocus={true} styleSheets={[]}>
					<style>@import "https://cdn.jsdelivr.xyz/npm/water.css@2/out/water.css";</style>
					<div
						id="module-readme"
						className="select-text"
						dangerouslySetInnerHTML={{ __html: fixRelativeImports(markdown) }}
					/>
				</ShadowRoot>
			);
		}
		case "error": {
			logger.error(error);
			return "Something went wrong.";
		}
	}
});

async function getLocalModuleInstance(moduleIdentifier: ModuleIdentifier, version: Version) {
	const localModule = RootModule.INSTANCE.getChild(moduleIdentifier);
	const localModuleInstance = await localModule?.instances.get(version);
	return localModuleInstance;
}

async function createRemoteModuleInstance(moduleIdentifier: ModuleIdentifier, version: Version, aurl: string) {
	const marketplaceModule = marketplaceModuleInstance.getModule();
	const remoteModule = await marketplaceModule.getChildOrNew(moduleIdentifier);
	const remoteModuleInstance = await remoteModule.newInstance(version, {
		installed: false,
		artifacts: [aurl],
		providers: [],
	});
	return remoteModuleInstance;
}

function useModuleInstance(moduleIdentifier: ModuleIdentifier, version: Version, aurl: string) {
	const local = useQuery({
		queryKey: ["getLocalModuleInstance", moduleIdentifier, version],
		queryFn: () => getLocalModuleInstance(moduleIdentifier, version),
	});

	const remote = useQuery({
		queryKey: ["createRemoteModuleInstance", moduleIdentifier, version, aurl],
		queryFn: () => createRemoteModuleInstance(moduleIdentifier, version, aurl),
		enabled: local.isSuccess && !local.data,
	});

	return [local.data ?? remote.data, local.refetch] as const;
}

export default function ({ aurl }: { aurl?: string }) {
	const routeMatch = useMatch("/bespoke/marketplace/module/:aurl");
	aurl ??= decodeURIComponent(routeMatch?.params?.aurl);

	const basename = aurl.slice(aurl.lastIndexOf("/") + 1);
	const artifactNameMatch = basename.match(/^(?<moduleIdentifier>[^@]+)@(?<version>[^@]+)\.zip$/);
	if (!artifactNameMatch || !artifactNameMatch.groups) {
		return "Invalid module URL";
	}
	const version = artifactNameMatch.groups.version;
	const moduleIdentifier = "/" + artifactNameMatch.groups.moduleIdentifier.replaceAll(".", "/");
	const murl = aurl.replace(/\.zip$/, ".metadata.json");

	const { data: metadata } = useSuspenseQuery({
		queryKey: ["modulePage", murl],
		queryFn: () => fetch(...proxy(murl)).then((res: any) => res.json() as Promise<Metadata>),
	});

	const [moduleInstance, refetchModuleInstance] = useModuleInstance(moduleIdentifier, version, aurl);

	if (!metadata || !moduleInstance) {
		return;
	}

	const isLocal = moduleInstance instanceof LocalModuleInstance;

	const label = t(isLocal ? "pages.module.remove" : "pages.module.install");

	const sharedButtonProps = {
		label,
		metadata,
		onUpdate: refetchModuleInstance,
	};

	const Button = isLocal
		? <RemoveButton {...sharedButtonProps} moduleInstance={moduleInstance} />
		: <AddButton {...sharedButtonProps} moduleInstance={moduleInstance} />;

	return (
		<section className="contentSpacing">
			<div className="marketplace-header items-center flex justify-between pb-2 flex-row z-10">
				<div className="marketplace-header__left flex gap-2">
					<h1>{t("pages.module.title")}</h1>
				</div>
				<div className="marketplace-header__right flex gap-2">
					{Button}
				</div>
			</div>
			<RemoteMarkdown url={metadata.readme} />
		</section>
	);
}

interface TrashButtonProps {
	label: string;
	moduleInstance: LocalModuleInstance;
	onUpdate: () => void;
}
const RemoveButton = (props: TrashButtonProps) => {
	return (
		<Button
			label={props.label}
			onClick={async (e) => {
				e.preventDefault();

				if (await props.moduleInstance.remove()) {
					props.onUpdate();
				}
			}}
		>
			<MdDeleteForever />
			{props.label}
		</Button>
	);
};

interface DownloadButtonProps {
	label: string;
	moduleInstance: RemoteModuleInstance;
	onUpdate: () => void;
}
const AddButton = (props: DownloadButtonProps) => {
	return (
		<Button
			label={props.label}
			onClick={async (e) => {
				e.preventDefault();

				if (await props.moduleInstance.add()) {
					props.onUpdate();
				}
			}}
		>
			<MdCloudDownload />
			{props.label}
		</Button>
	);
};
