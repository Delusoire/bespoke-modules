import { webpackRequire } from "/modules/stdlib/src/wpunpk.mix.ts";

import { modules } from "/modules/stdlib/src/webpack/index.ts";

export type ColorScheme<T = string> = {
	background: {
		base: T;
		highlight: T;
		press: T;
		elevated: {
			base: T;
			highlight: T;
			press: T;
		};
		tinted: {
			base: T;
			highlight: T;
			press: T;
		};
	};
	text: {
		base: T;
		subdued: T;
		brightAccent: T;
		negative: T;
		warning: T;
		positive: T;
		announcement: T;
	};
	essential: {
		base: T;
		subdued: T;
		brightAccent: T;
		negative: T;
		warning: T;
		positive: T;
		announcement: T;
	};
	decorative: {
		base: T;
		subdued: T;
	};
};

export type FlatColorScheme<T = string> = {
	backgroundBase: T;
	backgroundHighlight: T;
	backgroundPress: T;
	backgroundElevatedBase: T;
	backgroundElevatedHighlight: T;
	backgroundElevatedPress: T;
	backgroundTintedBase: T;
	backgroundTintedHighlight: T;
	backgroundTintedPress: T;
	textBase: T;
	textSubdued: T;
	textBrightAccent: T;
	textNegative: T;
	textWarning: T;
	textPositive: T;
	textAnnouncement: T;
	essentialBase: T;
	essentialSubdued: T;
	essentialBrightAccent: T;
	essentialNegative: T;
	essentialWarning: T;
	essentialPositive: T;
	essentialAnnouncement: T;
	decorativeBase: T;
	decorativeSubdued: T;
};

export type ColorSet =
	| "base"
	| "brightAccent"
	| "negative"
	| "negativeSubdued"
	| "warning"
	| "warningSubdued"
	| "positive"
	| "positiveSubdued"
	| "announcement"
	| "announcementSubdued"
	| "invertedDark"
	| "invertedLight"
	| "mutedAccent"
	| "overMedia";

export type ColorTheme<T = string> = {
	[key in ColorSet]: ColorScheme<T>;
};

export type FlatColorTheme<T = string> = {
	[key in ColorSet]: FlatColorScheme<T>;
};

export type ThemeType = "dark" | "light";

const [PaletteModuleID] = modules.find(([, m]) => m.toString().includes('"Invalid hexadecimal color input"'))!;
const PaletteModule = webpackRequire(PaletteModuleID);
const PaletteExports = Object.values(PaletteModule);

export const appliedColorTheme = PaletteExports.find((e: any) => e?.base?.background?.base) as ColorTheme;

export const generateColorSet = PaletteExports.find((e: any) =>
	/return{background:{base:[a-zA-Z_\$][\w\$]*\.toUpperCase\(\),/.test(e)
) as (primaryHex: string, secondaryHex?: string) => ColorScheme;

export const colorSchemeToCssAttributes = PaletteExports.find((e: any) =>
	e.toString().includes('" !important;\\n    "')
) as (
	scheme: ColorScheme,
) => string[];

export const colorSetToCssClassName = PaletteExports.find((e: any) =>
	e.toString().includes('"encore-"') && e.toString().includes('"-set"')
) as (set: ColorSet) => string;

const encoreThemeSelectors = {
	dark: ".encore-dark-theme",
	light: ".encore-light-theme",
};

export const colorSetSchemeToCss = (
	type: ThemeType,
	set: ColorSet,
	scheme: ColorScheme,
): string => {
	const themeSelector = encoreThemeSelectors[type];

	const setClassName = colorSetToCssClassName(set);
	const setSelector = `${themeSelector} .${setClassName}`;
	const selectors = [setSelector];
	if (set === "base") {
		selectors.unshift(themeSelector);
	}

	const attributes = colorSchemeToCssAttributes(scheme);

	return selectors.join(", ") + " {\n" +
		attributes.join("") +
		"\n}\n" +
		"\n" +
		selectors.map((s) => s + ">*").join(", ") + " {\n" +
		"\n      --parents-essential-base: " + scheme.essential.base + ";\n    " +
		"\n}\n" +
		"\n";
};

export const flattenColorScheme = <T>(scheme: ColorScheme<T>): FlatColorScheme<T> => {
	return {
		backgroundBase: scheme.background.base,
		backgroundHighlight: scheme.background.highlight,
		backgroundPress: scheme.background.press,
		backgroundElevatedBase: scheme.background.elevated.base,
		backgroundElevatedHighlight: scheme.background.elevated.highlight,
		backgroundElevatedPress: scheme.background.elevated.press,
		backgroundTintedBase: scheme.background.tinted.base,
		backgroundTintedHighlight: scheme.background.tinted.highlight,
		backgroundTintedPress: scheme.background.tinted.press,
		textBase: scheme.text.base,
		textSubdued: scheme.text.subdued,
		textBrightAccent: scheme.text.brightAccent,
		textNegative: scheme.text.negative,
		textWarning: scheme.text.warning,
		textPositive: scheme.text.positive,
		textAnnouncement: scheme.text.announcement,
		essentialBase: scheme.essential.base,
		essentialSubdued: scheme.essential.subdued,
		essentialBrightAccent: scheme.essential.brightAccent,
		essentialNegative: scheme.essential.negative,
		essentialWarning: scheme.essential.warning,
		essentialPositive: scheme.essential.positive,
		essentialAnnouncement: scheme.essential.announcement,
		decorativeBase: scheme.decorative.base,
		decorativeSubdued: scheme.decorative.subdued,
	};
};

export const nestColorScheme = <T>(scheme: FlatColorScheme<T>): ColorScheme<T> => {
	return {
		background: {
			base: scheme.backgroundBase,
			highlight: scheme.backgroundHighlight,
			press: scheme.backgroundPress,
			elevated: {
				base: scheme.backgroundElevatedBase,
				highlight: scheme.backgroundElevatedHighlight,
				press: scheme.backgroundElevatedPress,
			},
			tinted: {
				base: scheme.backgroundTintedBase,
				highlight: scheme.backgroundTintedHighlight,
				press: scheme.backgroundTintedPress,
			},
		},
		text: {
			base: scheme.textBase,
			subdued: scheme.textSubdued,
			brightAccent: scheme.textBrightAccent,
			negative: scheme.textNegative,
			warning: scheme.textWarning,
			positive: scheme.textPositive,
			announcement: scheme.textAnnouncement,
		},
		essential: {
			base: scheme.essentialBase,
			subdued: scheme.essentialSubdued,
			brightAccent: scheme.essentialBrightAccent,
			negative: scheme.essentialNegative,
			warning: scheme.essentialWarning,
			positive: scheme.essentialPositive,
			announcement: scheme.essentialAnnouncement,
		},
		decorative: {
			base: scheme.decorativeBase,
			subdued: scheme.decorativeSubdued,
		},
	};
};

import { toCamelCase } from "/hooks/std/text.ts";
import type { DarkLightPair } from "./palette.ts";

async function getDefaultColorThemes() {
	const themes = {
		dark: {},
		light: {},
	} as DarkLightPair<FlatColorTheme>;

	const css = await fetch("/xpui.css").then((r) => r.text());

	const R = /\.encore\-(dark|light)\-theme \.encore\-([^{]+)\-set\{([^}]+)\}/g;

	for (const match of css.matchAll(R)) {
		const [, type, set, attributes] = match as unknown as [any, ThemeType, string, string];

		const entries = attributes.split(";").map((attr) => {
			const [name, value] = attr.split(":");

			return [toCamelCase(name) as keyof FlatColorScheme, value.trim().replaceAll(/(?<!\d)\./g, "0.")];
		});

		themes[type][toCamelCase(set) as ColorSet] = Object.fromEntries(entries);
	}

	return themes;
}

export const defaultThemes = await getDefaultColorThemes();
