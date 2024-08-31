/* Copyright (C) 2024 harbassan, and Delusoire
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { type CondensedPalette, Palette, PaletteManager } from "./palette.ts";
import { ModuleInstance } from "/hooks/index.ts";

class Schemer {
	constructor(private mod: ModuleInstance) {}

	palettes = new Set<Palette>();

	getPaletteId(name: string) {
		return `${this.mod.getModuleIdentifier()}#${name}`;
	}

	getPalette(name: string) {
		return PaletteManager.INSTANCE.staticPalettes.get(this.getPaletteId(name));
	}

	register(name: string, colors: CondensedPalette) {
		const palette = new Palette(this.getPaletteId(name), name, colors);
		this.palettes.add(palette);
		PaletteManager.INSTANCE.staticPalettes.set(palette.id, palette);
		if (PaletteManager.INSTANCE.isCurrent(palette)) {
			PaletteManager.INSTANCE.setCurrent(palette);
		}
		return this;
	}

	unregister(name: string) {
		const palette = PaletteManager.INSTANCE.staticPalettes.get(this.getPaletteId(name));
		if (!palette) return;
		this.palettes.delete(palette);
		PaletteManager.INSTANCE.staticPalettes.delete(palette.id);
	}

	dispose() {
		for (const palette of this.palettes) {
			this.unregister(palette.name);
		}
	}
}

export function createSchemer(mod: ModuleInstance) {
	const schemer = new Schemer(mod);

	const unloadJs = mod._unloadJs!;
	mod._unloadJs = () => {
		schemer.dispose();
		return unloadJs();
	};

	return schemer;
}
