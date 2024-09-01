import { mapValues } from "/hooks/std/collections.ts";

import { Color } from "/modules/stdlib/src/webpack/misc.xpui.ts";

import {
	appliedColorTheme,
	type ColorSets,
	type ColorTheme,
	defaultColorTheme,
	generateColorSet,
	toCssAttributes,
	toCssClassName,
} from "./webpack.ts";
import { EntityManager, Serializable, serializableEntityMixin, SerializedEntity } from "./entity.ts";
import { storage } from "../preload.ts";
import { PaletteContext, Schemer } from "./schemer.ts";

const LS_ACTIVE_PALETTE = "active_palette";
const LS_PALETTES = "palettes";

type TwoUplet<T> = [T, T];

type SerializedThemeData = Record<ColorSets, TwoUplet<{}>>;
export class Theme implements Serializable<SerializedThemeData> {
	constructor(private theme: { [key in ColorSets]: TwoUplet<Color> }) {}

	getColors() {
		return this.theme;
	}

	setColor(set: ColorSets, index: number, color: Color) {
		this.theme[set] = this.theme[set].toSpliced(index, 1, color) as TwoUplet<Color>;
	}

	getColorTheme(): ColorTheme {
		return mapValues(this.theme, (colors) => {
			const colorsHex = colors.map((c) => c.toCSS(Color.Format.HEX)) as TwoUplet<string>;
			const paletteObj = generateColorSet(...colorsHex);
			return paletteObj;
		});
	}

	getCSS() {
		const encoreDarkThemeSelector = ".encore-dark-theme";
		return Object.entries(this.getColorTheme()).map(([set, paletteObj]) => {
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

	toJSON(): SerializedThemeData {
		const theme = mapValues(
			this.theme,
			(colors) => colors.map((color) => Object.assign({}, color)) as TwoUplet<string>,
		);
		return theme;
	}

	static fromJSON(json: SerializedThemeData) {
		const theme = mapValues(
			json,
			(colors) => colors.map((color) => Color.parse(JSON.stringify(color))) as TwoUplet<Color>,
		);
		return new Theme(theme);
	}

	copy() {
		return Theme.fromJSON(this.toJSON());
	}

	static createDefault() {
		const colors = ["#000000", "#ffffff"].map((c) => Color.fromHex(c)) as TwoUplet<string>;
		const theme = mapValues(defaultColorTheme, () => colors);
		return new Theme(theme);
	}
}

export interface Palette {
	Context: PaletteContext;
}
export class Palette extends serializableEntityMixin(Theme, PaletteContext, Schemer) {}

export class PaletteManager extends EntityManager<Palette> {
	public static override Entity = Palette;
	public static INSTANCE = new PaletteManager();

	_init() {
		const serializedPalettes: SerializedEntity<Palette>[] = JSON.parse(storage.getItem(LS_PALETTES) ?? "[]");
		const palettes = serializedPalettes.map((json) => Palette.fromJSON(json));
		for (const palette of palettes) {
			this.entities.set(palette.id, palette);
		}

		const paletteId: string | null = JSON.parse(storage.getItem(LS_ACTIVE_PALETTE) ?? "null");
		const palette = this.entities.get(paletteId!) ?? null;
		if (palette) {
			this.toggleActive(palette);
		}
	}

	public override save(): void {
		storage.setItem(LS_PALETTES, JSON.stringify(this.getAll()));
	}

	public override async applyActive() {
		let css: string;
		let colorTheme: ColorTheme;

		const [active] = this.getAllActive();

		if (active && active.data) {
			css = active.data.getCSS();
			colorTheme = active.data.getColorTheme();
		} else {
			css = "";
			colorTheme = defaultColorTheme;
		}

		await this.stylesheet.replace(css);
		for (const [set, paletteObj] of Object.entries(colorTheme)) {
			Object.assign(appliedColorTheme[set as ColorSets], paletteObj);
		}

		this.saveActive();
	}

	public override async saveActive() {
		const [active] = this.getAllActive();
		const id = active?.id ?? null;
		storage.setItem(LS_ACTIVE_PALETTE, JSON.stringify(id));
	}
}
