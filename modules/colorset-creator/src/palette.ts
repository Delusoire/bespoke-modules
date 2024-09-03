import { deepMerge, mapValues } from "/hooks/std/collections.ts";

import { Color } from "/modules/stdlib/src/webpack/misc.xpui.ts";

import {
	appliedColorTheme,
	type ColorSet,
	colorSetSchemeToCss,
	type ColorTheme,
	defaultThemes,
	FlatColorScheme,
	FlatColorTheme,
	flattenColorScheme,
	nestColorScheme,
	ThemeType,
} from "./webpack.ts";
import { EntityManager, Serializable, serializableEntityMixin, SerializedEntity } from "./entity.ts";
import { storage } from "../preload.ts";
import { PaletteContext, Schemer } from "./schemer.ts";

const LS_ACTIVE_PALETTE = "active_palette";
const LS_PALETTES = "palettes";

export type DarkLightPair<T> = { dark: T; light: T };
type SerializedColor = {};
type SerializedThemeData = ColorTheme<DarkLightPair<SerializedColor>>;
export class Theme implements Serializable<SerializedThemeData> {
	constructor(private theme: FlatColorTheme<DarkLightPair<Color>>) {}

	getColors() {
		return this.theme;
	}

	setColor(type: ThemeType, set: ColorSet, attribute: keyof FlatColorScheme, color: Color) {
		this.theme[set][attribute][type] = color;
	}

	getColorTheme(): DarkLightPair<ColorTheme> {
		const themes = {
			dark: {} as ColorTheme,
			light: {} as ColorTheme,
		};

		for (const [set, scheme] of Object.entries(this.theme)) {
			const flatColorSchemes = {
				dark: {} as FlatColorScheme<Color>,
				light: {} as FlatColorScheme<Color>,
			};

			for (const [attribute, colorPair] of Object.entries(scheme)) {
				for (const [type, color] of Object.entries(colorPair)) {
					flatColorSchemes[type as ThemeType][attribute as keyof FlatColorScheme] = color.toCSS(
						Color.Format.HEXA,
					);
				}
			}

			for (const [type, colorTheme] of Object.entries(themes)) {
				colorTheme[set as ColorSet] = nestColorScheme<Color>(flatColorSchemes[type as ThemeType]);
			}
		}

		return themes;
	}

	getCSS() {
		const themes = this.getColorTheme();

		return Object.entries(themes).map(([type, theme]) => {
			return Object.entries(theme).map(([set, scheme]) =>
				colorSetSchemeToCss(type as ThemeType, set as ColorSet, scheme)
			);
		}).join("\n");
	}

	toJSON(): SerializedThemeData {
		return mapValues(
			this.theme,
			(scheme) =>
				nestColorScheme(
					mapValues(scheme, (colorPair) => mapValues(colorPair, (color) => Object.assign({}, color))),
				),
		);
	}

	static fromJSON(json: SerializedThemeData) {
		const theme = mapValues(
			json,
			(scheme) =>
				mapValues(
					flattenColorScheme(scheme),
					(colorPair) => mapValues(colorPair, (color) => Color.parse(JSON.stringify(color)) as Color),
				),
		);
		return new Theme(theme);
	}

	copy() {
		return Theme.fromJSON(this.toJSON());
	}

	static createDefault() {
		const themes = {
			dark: {} as FlatColorTheme<{ dark: Color }>,
			light: {} as FlatColorTheme<{ light: Color }>,
		};

		for (const [type, theme] of Object.entries(defaultThemes)) {
			for (const [set, scheme] of Object.entries(theme)) {
				themes[type as ThemeType][set as ColorSet] = mapValues(
					scheme,
					(color) => ({ [type]: Color.fromCSS(color) as Color }),
				) as FlatColorScheme<DarkLightPair<Color>>;
			}
		}

		return new Theme(deepMerge(themes.dark, themes.light));
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
		const paletteIds: string[] = JSON.parse(storage.getItem(LS_PALETTES) ?? "[]");
		const serializedPalettes: SerializedEntity<Palette>[] = paletteIds
			.map((id) => JSON.parse(storage.getItem(LS_PALETTES + ":" + id) ?? "null"))
			.filter(Boolean);
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

	public override save(palette: Palette): void {
		storage.setItem(LS_PALETTES + ":" + palette.id, JSON.stringify(palette));
	}

	public override unsave(palette: Palette): void {
		storage.removeItem(LS_PALETTES + ":" + palette.id);
	}

	public override async applyActive() {
		let css: string;
		let colorTheme: ColorTheme;

		const [active] = this.getAllActive();

		if (active && active.data) {
			css = active.data.getCSS();
			colorTheme = active.data.getColorTheme().light;
		} else {
			css = "";
			colorTheme = mapValues(defaultThemes.light, (scheme) => nestColorScheme(scheme));
		}

		await this.stylesheet.replace(css);
		for (const [set, paletteObj] of Object.entries(colorTheme)) {
			Object.assign(appliedColorTheme[set as ColorSet], paletteObj);
		}

		this.saveActive();
	}

	public override async saveActive() {
		const [active] = this.getAllActive();
		const id = active?.id ?? null;
		storage.setItem(LS_ACTIVE_PALETTE, JSON.stringify(id));
	}
}
