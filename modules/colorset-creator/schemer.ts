import { ModuleInstance } from "/hooks/module.ts";
import { Palette, PaletteContext, Theme } from "./palette.ts";
import { EntityContext } from "./entity.ts";
import { Config, Configlet, ConfigletContext } from "./configlet.ts";

export class Schemer {
	public static INSTANCES = new Map<ModuleInstance, Schemer>();

	constructor(private mod: ModuleInstance) {
		if (Schemer.INSTANCES.has(mod)) {
			throw new Error("Schemer already exists for this module");
		}
		Schemer.INSTANCES.set(mod, this);
	}

	private palettes = new Map<string, Palette>();
	private configlets = new Map<string, Configlet>();

	static get(context: PaletteContext): Palette | null;
	static get(context: ConfigletContext): Configlet | null;
	static get(context: EntityContext): unknown {
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

	registerPalette(id: string, name: string, theme: Theme) {
		const palette = new Palette(id, name, theme, new PaletteContext(this.getModuleIdentifier(), id));
		this.palettes.set(id, palette);
	}

	registerConfiglet(id: string, name: string, config: Config) {
		const configlet = new Configlet(id, name, config, new ConfigletContext(this.getModuleIdentifier(), id));
		this.configlets.set(id, configlet);
	}
}

export function createSchemer(mod: ModuleInstance) {
	const schemer = new Schemer(mod);

	return schemer;
}
