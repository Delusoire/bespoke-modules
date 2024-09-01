import type { ModuleInstance } from "/hooks/module.ts";

import type { Palette } from "./palette.ts";
import type { Configlet } from "./configlet.ts";

import { EntityContext } from "./entity.ts";

export class PaletteContext extends EntityContext {}
export class ConfigletContext extends EntityContext {}

export class Schemer {
	public static INSTANCES = new Map<ModuleInstance, Schemer>();

	constructor(private mod: ModuleInstance) {
		if (Schemer.INSTANCES.has(mod)) {
			throw new Error("Schemer already exists for this module");
		}
		Schemer.INSTANCES.set(mod, this);
	}

	palettes = new Map<string, Palette>();
	configlets = new Map<string, Configlet>();

	static get(context: PaletteContext): Palette | null;
	static get(context: ConfigletContext): Configlet | null;
	static get(context: EntityContext): unknown | null {
		const module = context.getModuleInstance();
		if (!module) {
			return null;
		}

		const schemer = Schemer.INSTANCES.get(module);
		if (!schemer) {
			return null;
		}

		if (context instanceof PaletteContext) {
			return schemer.palettes.get(context.id) ?? null;
		}
		if (context instanceof ConfigletContext) {
			return schemer.configlets.get(context.id) ?? null;
		}

		return null;
	}

	static instances() {
		return Array.from(this.INSTANCES.values());
	}

	getPalettes() {
		return this.palettes;
	}

	getConfiglets() {
		return this.configlets;
	}

	getModuleIdentifier() {
		return this.mod.getModuleIdentifier();
	}
}
