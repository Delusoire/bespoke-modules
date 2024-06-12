import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { ReactDOM } from "/modules/official/stdlib/src/webpack/React.ts";
import Button from "../components/Button/index.tsx";
import LoadingIcon from "../components/icons/LoadingIcon.tsx";
import TrashIcon from "../components/icons/TrashIcon.tsx";
import { t } from "../i18n.ts";
import { renderMarkdown } from "../api/github.ts";
import { logger } from "../../index.tsx";
import {
	LocalModuleInstance,
	type Metadata,
	Module,
	ModuleIdentifier,
	RemoteModuleInstance,
	RootModule,
	Version,
} from "/hooks/module.ts";
import { fetchJSON } from "/hooks/util.ts";
import { useQuery, useSuspenseQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.ts";
import { module as marketplaceModuleInstance } from "/modules/Delusoire/marketplace/index.tsx";
import { MI } from "./Marketplace.tsx";

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

const RemoteMarkdown = React.memo(({ url }: { url: string }) => {
	const {
		status,
		error,
		data: markdown,
	} = useQuery({
		queryKey: ["markdown", url],
		queryFn: () =>
			fetch(url)
				.then((res) => res.text())
				.then((markdown) => renderMarkdown(markdown)),
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

export default function ({ aurl }: { aurl: string }) {
	const basnename = aurl.slice(aurl.lastIndexOf("/") + 1);
	const match = basnename.match(/^(<moduleIdentifier>[^@]+)@(<version>[^@]+)\.zip$/);
	if (!match || !match.groups) {
		return <div>Invalid module URL</div>;
	}
	const { moduleIdentifier, version } = match.groups;

	const murl = aurl.replace(/\.zip$/, ".metadata.json");
	const { data: metadata } = useSuspenseQuery({
		queryKey: ["modulePage", murl],
		queryFn: () => fetchJSON<Metadata>(murl),
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
		? <TrashButton {...sharedButtonProps} moduleInstance={moduleInstance} />
		: <DownloadButton {...sharedButtonProps} moduleInstance={moduleInstance} />;

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
const TrashButton = (props: TrashButtonProps) => {
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
			<TrashIcon />
			{props.label}
		</Button>
	);
};

interface DownloadButtonProps {
	label: string;
	moduleInstance: RemoteModuleInstance;
	onUpdate: () => void;
}
const DownloadButton = (props: DownloadButtonProps) => {
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
			<TrashIcon />
			{props.label}
		</Button>
	);
};
