/* Copyright (C) 2024 harbassan, and Delusoire
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createRegistrar } from "/modules/stdlib/mod.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

import type { ModuleInstance } from "/hooks/index.ts";

export default async function (mod: ModuleInstance) {
	const registrar = createRegistrar(mod);

	const { EditButton } = await import("./paletteManager.tsx");

	registrar.register("topbarLeftButton", <EditButton />);

	const { createSchemer } = await import("./schemer.ts");

	const schemer = createSchemer(mod);
}
