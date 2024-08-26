/* Copyright (C) 2024 harbassan, and Delusoire
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createRegistrar } from "/modules/stdlib/mod.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

import type { Module } from "/hooks/index.ts";

export default async function (mod: Module) {
	const registrar = createRegistrar(mod);

	const { EditButton } = await import("./paletteManager.tsx");

	registrar.register("topbarLeftButton", <EditButton />);

	const schemer = await import("./schemer.ts");

	schemer.createSchemer(mod);
}
