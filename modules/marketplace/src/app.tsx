import Marketplace from "./pages/Marketplace.tsx";
import ModulePage from "./pages/Module.tsx";
import { Route, Routes } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";

export default function () {
	return (
		<div id="marketplace">
			<Routes>
				<Route path="/" element={<Marketplace />} />
				<Route path="/module/:aurl" element={<ModulePage />} />
			</Routes>
		</div>
	);
}
