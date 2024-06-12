
import Marketplace from "./pages/Marketplace.tsx";
import ModulePage from "./pages/Module.tsx";
import { Routes, Route } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { useMatch } from "/modules/official/stdlib/src/webpack/ReactRouter.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";


export default function () {
	const match = useMatch("/bespoke/marketplace/:aurl");
	const aurl = decodeURIComponent(match?.params?.aurl);

	return (
		<div id="marketplace">
			<Routes>
				<Route path="/" element={<Marketplace />} />
				<Route path=":murl" element={<ModulePage aurl={aurl} />} />
			</Routes>
		</div>
	);
}
