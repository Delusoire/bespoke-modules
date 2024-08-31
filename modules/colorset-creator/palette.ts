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
import { EntityContext, Serializable, serializableEntityMixin, SerializedEntity } from "./entity.ts";
import { mapValues } from "/hooks/std/collections.ts";
import { storage } from "./preload.ts";

const LS_ACTIVE_PALETTE = "active_palette";
const LS_PALETTES = "palettes";

type TwoUplet<T> = [T, T];

type SerializedThemeData = Record<ColorSets, TwoUplet<string>>;
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
			(colors) => colors.map((color) => JSON.stringify(color)) as TwoUplet<string>,
		);
		return theme;
	}

	static fromJSON(json: SerializedThemeData) {
		const theme = mapValues(json, (colors) => colors.map((color) => Color.parse(color)) as TwoUplet<Color>);
		return new Theme(theme);
	}

	copy() {
		return Theme.fromJSON(this.toJSON());
	}

	static createDefault() {
		const colors = ["#000000", "#ffffff"].map((c) => JSON.stringify(Color.fromHex(c))) as TwoUplet<string>;
		const themeJSON = mapValues(defaultColorTheme, () => colors);

		return Theme.fromJSON(themeJSON);
	}
}

class PaletteContext extends EntityContext {}
export interface Palette {
	Context: PaletteContext;
}
export class Palette extends serializableEntityMixin(Theme, PaletteContext) {
	static Context = PaletteContext;
}

export class PaletteManager {
	public static INSTANCE = new PaletteManager();
	palettes = new Map<string, Palette>();
	private active: Palette | null = null;
	private stylesheet = new CSSStyleSheet();

	private constructor() {
		document.adoptedStyleSheets.push(this.stylesheet);
	}

	_init() {
		const serializedPalettes: SerializedEntity<Palette>[] = JSON.parse(storage.getItem(LS_PALETTES) ?? "[]");
		const palettes = serializedPalettes.map((json) => Palette.fromJSON(json));
		for (const palette of palettes) {
			this.palettes.set(palette.id, palette);
		}

		const paletteId: string | null = JSON.parse(storage.getItem(LS_ACTIVE_PALETTE) ?? "null");
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
		storage.setItem(LS_PALETTES, JSON.stringify(this.getPalettes()));
	}

	public getCurrent(): Palette | null {
		return this.active;
	}

	public setCurrent(palette: Palette | null) {
		this.active = palette;
		this.applyCurrent();
		return palette;
	}

	public async applyCurrent() {
		let css: string;
		let colorTheme: ColorTheme;

		if (this.active && this.active.data) {
			css = this.active.data.getCSS();
			colorTheme = this.active.data.getColorTheme();
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
		const id = this.active?.id ?? null;
		storage.setItem(LS_ACTIVE_PALETTE, JSON.stringify(id));
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
		this.save();
	}

	public isCurrent(palette: Palette) {
		return palette.id === this.active?.id;
	}

	public dispose() {
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== this.stylesheet);
	}
}
