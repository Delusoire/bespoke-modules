import { createLogger, createRegistrar, createStorage } from "/modules/official/stdlib/index.ts";
import { createSettings } from "/modules/official/stdlib/lib/settings.tsx";
import { React } from "/modules/official/stdlib/src/expose/React.ts";

import { NavLink } from "/modules/official/stdlib/src/registers/navlink.tsx";
import type { Module } from "/hooks/index.ts";
import type { Settings } from "/modules/official/stdlib/lib/settings.tsx";
import { ACTIVE_ICON, ICON } from "./src/static.ts";
import { Route } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import panelReg from "/modules/official/stdlib/src/registers/panel.ts";
import VersionList from "./src/components/VersionList/index.tsx";

export let storage: Storage;
export let logger: Console;
export let settings: Settings;
export let settingsButton: React.JSX.Element;

export let hash: { state: string; event: string } | undefined;

export let module: Module;

export default function (mod: Module) {
	module = mod;
	storage = createStorage(mod);
	logger = createLogger(mod);
	[settings, settingsButton] = createSettings(mod);
	const registrar = createRegistrar(mod);

	const LazyApp = React.lazy(() => import("./src/app.js"));
	registrar.register("route", <Route path={"/bespoke/marketplace/*"} element={<LazyApp />} />);

	registrar.register("navlink", <MarketplaceLink />);

	const panel = <VersionList />;
	registrar.register("panel", panel);
	hash = panelReg.getHash(panel)!;
}

const MarketplaceLink = () => (
	<NavLink
		localizedApp="Marketplace"
		appRoutePath="/bespoke/marketplace"
		icon={ICON}
		activeIcon={ACTIVE_ICON}
	/>
);
