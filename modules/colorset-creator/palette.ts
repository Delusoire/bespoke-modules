import { createStorage } from "/modules/stdlib/mod.ts";
import type { ModuleInstance } from "/hooks/module.ts";
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
import { Entity, EntityContext, SerializedEntityContext } from "./entity.ts";
import { mapValues } from "/hooks/std/collections.ts";
import { Schemer } from "./schemer.ts";

let storage: Storage;
export default function (mod: ModuleInstance) {
	storage = createStorage(mod);
	PaletteManager.INSTANCE._init();
}

type TwoUplet<T> = [T, T];

type SerializedThemeData = Record<ColorSets, TwoUplet<string>>;
class ThemeData {
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
			(colors) => colors.map((color) => JSON.stringify(color)) as TwoUplet<string>,
		);
		return theme;
	}

	static fromJSON(json: SerializedThemeData) {
		const theme = mapValues(json, (colors) => colors.map((color) => Color.parse(color)) as TwoUplet<Color>);
		return new ThemeData(theme);
	}

	copy() {
		return ThemeData.fromJSON(this.toJSON());
	}

	static createDefault() {
		const colors = ["#000000", "#ffffff"].map((c) => JSON.stringify(Color.fromHex(c))) as TwoUplet<string>;
		const themeJSON = mapValues(defaultColorTheme, () => colors);

		return ThemeData.fromJSON(themeJSON);
	}
}

export class PaletteContext extends EntityContext {}

type SerializedPalette = {
	id: string;
	name: string;
	theme: SerializedThemeData;
	context: SerializedEntityContext | null;
};
export class Palette extends Entity<PaletteContext> {
	constructor(id: string, name: string, public theme: ThemeData, context: PaletteContext | null = null) {
		super(id, name, context);
	}

	toJSON(): SerializedPalette {
		return {
			id: this.id,
			name: this.name,
			theme: this.theme.toJSON(),
			context: this.context?.toJSON() ?? null,
		};
	}

	static fromJSON(json: SerializedPalette) {
		let context: PaletteContext | null = null;
		if (json.context) {
			context = PaletteContext.fromJSON(json.context);
		}

		return new Palette(
			json.id,
			json.name,
			ThemeData.fromJSON(json.theme),
			context,
		);
	}

	static create(name: string, theme: ThemeData, context: PaletteContext | null = null) {
		return new Palette(crypto.randomUUID(), name, theme, context);
	}

	static createDefault(name?: string, context: PaletteContext | null = null) {
		const palette = context ? Schemer.get(context) : null;

		if (palette) {
			return Palette.create(name ?? palette.name, palette.theme.copy(), context);
		}

		return Palette.create(name ?? "New Palette", ThemeData.createDefault(), context);
	}
}

export class PaletteManager {
	public static INSTANCE = new PaletteManager();
	palettes = new Map<string, Palette>();
	private palette: Palette | null = null;
	private stylesheet = new CSSStyleSheet();

	private constructor() {
		document.adoptedStyleSheets.push(this.stylesheet);
	}

	_init() {
		const serializedPalettes: SerializedPalette[] = JSON.parse(storage.getItem("palettes") ?? "[]");
		const palettes = serializedPalettes.map((json) => Palette.fromJSON(json));
		for (const palette of palettes) {
			this.palettes.set(palette.id, palette);
		}

		const paletteId: string | null = JSON.parse(storage.getItem("palette") ?? "null");
		const palette = this.palettes.get(paletteId!) ?? null;
		this.setCurrent(palette);
	}

	public getDefault(): Palette | null {
		return this.palettes.values().next().value ?? null;
	}

	public getPalettes(): Palette[] {
		return Array.from(this.palettes.values());
	}

	public save(): void {
		storage.setItem("palettes", JSON.stringify(this.getPalettes()));
	}

	public getCurrent(): Palette | null {
		return this.palette;
	}

	public setCurrent(palette: Palette | null) {
		this.palette = palette;
		this.applyCurrent();
		return palette;
	}

	public async applyCurrent() {
		let css: string;
		let colorTheme: ColorTheme;

		if (this.palette && this.palette.theme) {
			css = this.palette.theme.getCSS();
			colorTheme = this.palette.theme.getColorTheme();
		} else {
			css = "";
			colorTheme = defaultColorTheme;
		}

		await this.stylesheet.replace(css);
		for (const [set, paletteObj] of Object.entries(colorTheme)) {
			Object.assign(appliedColorTheme[set as ColorSets], paletteObj);
		}

		this.saveCurrent();
	}

	public saveCurrent() {
		storage.setItem("palette", JSON.stringify(this.palette?.id ?? null));
	}

	public addPalette(palette: Palette) {
		this.palettes.set(palette.id, palette);
		this.save();
	}

	public deletePalette(palette: Palette) {
		this.palettes.delete(palette.id);
		if (this.isCurrent(palette)) {
			this.setCurrent(null);
		}
		this.save();
	}

	public renamePalette(palette: Palette, name: string) {
		palette.name = name;
		if (this.isCurrent(palette)) {
			this.saveCurrent();
		}
		this.save();
	}

	public isCurrent(palette: Palette) {
		return palette.id === this.getCurrent()?.id;
	}

	public dispose() {
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== this.stylesheet);
	}
}
