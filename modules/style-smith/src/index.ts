import type { ModuleInstance } from "/hooks/module.ts";

import { Schemer } from "./schemer.ts";

import { type Config, Configlet } from "./configlet.ts";
import { Palette, type Theme } from "./palette.ts";

export function createSchemer(mod: ModuleInstance) {
	const schemer = new Schemer(mod);

	return {
		registerPalette(id: string, name: string, theme: Theme) {
			const palette = new Palette(
				id,
				name,
				theme,
				new Palette.Context(schemer.getModuleIdentifier(), id),
			);
			schemer.palettes.set(id, palette);
		},
		registerConfiglet(id: string, name: string, config: Config) {
			const configlet = new Configlet(
				id,
				name,
				config,
				new Configlet.Context(schemer.getModuleIdentifier(), id),
			);
			schemer.configlets.set(id, configlet);
		},
	};
}
