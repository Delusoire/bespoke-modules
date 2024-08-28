/* Copyright (C) 2024 harbassan, and Delusoire
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createStorage } from "/modules/stdlib/mod.ts";
import type { ModuleInstance } from "/hooks/index.ts";
import { Color } from "/modules/stdlib/src/webpack/misc.xpui.ts";
import {
	type ColorSets,
	type ColorSetsObjs,
	generateColorSet,
	paletteObjs,
	toCssAttributes,
	toCssClassName,
} from "./webpack.ts";

let storage: Storage;
export default function (mod: ModuleInstance) {
	storage = createStorage(mod);
	PaletteManager.INSTANCE._init();
}

// TODO: edit these keys
const def_fields = {
	base: [Color.fromHex("#000000"), Color.fromHex("#ffffff")],
	brightAccent: [Color.fromHex("#1ed760"), Color.fromHex("#ffffff")],
	negative: [Color.fromHex("#ff0000"), Color.fromHex("#ffffff")],
	negativeSubdued: [Color.fromHex("#ff0000"), Color.fromHex("#ffffff")],
	warning: [Color.fromHex("#ff0000"), Color.fromHex("#ffffff")],
	warningSubdued: [Color.fromHex("#ff0000"), Color.fromHex("#ffffff")],
	positive: [Color.fromHex("#1ed760"), Color.fromHex("#ffffff")],
	positiveSubdued: [Color.fromHex("#1ed760"), Color.fromHex("#ffffff")],
	announcement: [Color.fromHex("#3d91f4"), Color.fromHex("#ffffff")],
	announcementSubdued: [Color.fromHex("#3d91f4"), Color.fromHex("#ffffff")],
	invertedDark: [Color.fromHex("#000000"), Color.fromHex("#ffffff")],
	invertedLight: [Color.fromHex("#ffffff"), Color.fromHex("#000000")],
	mutedAccent: [Color.fromHex("#1ed760"), Color.fromHex("#ffffff")],
	overMedia: [Color.fromHex("#1ed760"), Color.fromHex("#ffffff")],
} as CondensedPalette;

export type CondensedPalette = { [key in ColorSets]: [Color, ...Color[]] };

type PaletteData = { id: string; name: string; colors: { [key in ColorSets]: [string, ...string[]] } };

export class Palette {
	constructor(
		public id: string,
		public name: string,
		public colors: CondensedPalette,
		public isStatic = true,
	) {}

	overwrite(colors: CondensedPalette) {
		if (this.isStatic) {
			return false;
		}
		this.colors = colors;
		return true;
	}

	getColorSetObjs(): ColorSetsObjs {
		return Object.fromEntries(
			Object.entries(this.colors).map(([set, colors]) => {
				const colorsHex = colors.map((c) => c.toCSS(Color.Format.HEX)) as [string, ...string[]];
				const paletteObj = generateColorSet(...colorsHex);
				return [set as ColorSets, paletteObj];
			}),
		) as ColorSetsObjs;
	}

	getCSS() {
		const encoreDarkThemeSelector = ".encore-dark-theme";
		return Object.entries(this.getColorSetObjs()).map(([set, paletteObj]) => {
			const setClassName = toCssClassName(set);
			const setSelector = `${encoreDarkThemeSelector} .${setClassName}`;
			const selectors = [setSelector];
			if (set === "base") {
				selectors.unshift(encoreDarkThemeSelector);
			}

			const attributes = toCssAttributes(paletteObj);

			return selectors.join(", ") + " {\n" +
				attributes.join("") +
				"\n}\n" +
				"\n" +
				selectors.map((s) => s + ">*").join(", ") + " {\n" +
				"\n      --parents-essential-base: " + paletteObj.essential.base + ";\n    " +
				"\n}\n" +
				"\n";
		}).join("\n");
	}

	toJSON(): PaletteData {
		const palette: PaletteData["colors"] = {};
		for (const [set, colors] of Object.entries(this.colors)) {
			palette[set] = colors.map((c) => JSON.stringify(c) as string);
		}
		return { id: this.id, name: this.name, colors: palette };
	}

	static fromJSON(json: PaletteData) {
		const palette: CondensedPalette = {};
		for (const [set, colors] of Object.entries(json.colors)) {
			palette[set] = colors.map((c) => Color.parse(c) as Color);
		}
		return new Palette(json.id, json.name, palette, false);
	}
}

const defaultPalette = new Palette("default", "Spotify • default", def_fields);

export class PaletteManager {
	public static INSTANCE = new PaletteManager();
	staticPalettes = new Map<string, Palette>([[defaultPalette.id, defaultPalette]]);
	userPalettes = new Set<Palette>();
	private palette!: Palette;
	private stylesheet = document.createElement("style");

	private constructor() {
		document.head.appendChild(this.stylesheet);
	}

	_init() {
		const paletteStr = storage.getItem("palette");
		const palette: Palette = paletteStr ? Palette.fromJSON(JSON.parse(paletteStr)) : this.getDefault();

		this.setCurrent(palette);

		this.initUserPalettes();
	}

	private initUserPalettes() {
		const userPalettesJSON: PaletteData[] = JSON.parse(storage.getItem("user_palettes") || "[]");
		const userPalettes = userPalettesJSON.map((json) => Palette.fromJSON(json));
		for (const palette of userPalettes) {
			this.userPalettes.add(palette);
			if (this.isCurrent(palette)) {
				this.setCurrent(palette);
			}
		}
	}

	public getDefault(): Palette {
		return this.staticPalettes.values().next().value;
	}

	public getPalettes(): Palette[] {
		return [...this.userPalettes, ...this.staticPalettes.values()];
	}

	public save(): void {
		storage.setItem("user_palettes", JSON.stringify(Array.from(this.userPalettes)));
	}

	public getCurrent(): Palette {
		return this.palette;
	}

	public setCurrent(palette: Palette): Palette {
		this.palette = palette;
		this.writeCurrent();
		return palette;
	}

	public writeCurrent() {
		this.stylesheet.innerHTML = this.palette.getCSS();
		for (const [set, paletteObj] of Object.entries(this.palette.getColorSetObjs())) {
			Object.assign(paletteObjs[set as ColorSets], paletteObj);
		}
		this.saveCurrent();
	}

	public saveCurrent() {
		storage.setItem("palette", JSON.stringify(this.palette));
	}

	public addUserPalette(palette: Palette) {
		this.userPalettes.add(palette);
		this.save();
	}

	public deleteUserPalette(palette: Palette) {
		this.userPalettes.delete(palette);
		if (this.isCurrent(palette)) {
			this.setCurrent(this.getDefault());
		}
		this.save();
	}

	public renameUserPalette(palette: Palette, name: string) {
		palette.name = name;
		if (this.isCurrent(palette)) {
			this.saveCurrent();
		}
		this.save();
	}

	public isCurrent(palette: Palette) {
		return palette.id === this.getCurrent().id;
	}
}
