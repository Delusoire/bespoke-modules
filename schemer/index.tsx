import { S } from "/modules/Delusoire/stdlib/index.js";
import { SVGIcons, createRegistrar } from "/modules/Delusoire/stdlib/index.js";

import { display } from "/modules/Delusoire/stdlib/lib/modal.js";
import { Button } from "/modules/Delusoire/stdlib/src/registers/topbarLeftButton.js";

import SchemerModal from "./modal.js";
import * as sm from "./schemes.js";

import type { Module } from "/hooks/module.js";

const SchemeEdit = () => {
	return (
		<Button
			label="playlist-stats"
			icon={SVGIcons.edit}
			onClick={() => {
				display({ title: "Schemer", content: <SchemerModal />, isLarge: true });
			}}
		/>
	);
};

export default function (mod: Module) {
	const registrar = createRegistrar(mod);
	registrar.register("topbarLeftButton", SchemeEdit);

	test();
}

function test() {
	sm.create_statics(
		[
			{ name: "Red Text", fields: { text: "#ff0000" } },
			{ name: "Green Text", fields: { text: "#00ff00" } },
			{ name: "Blue Text", fields: { text: "#0000ff" } },
		],
		"default",
	);
}
