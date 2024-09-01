import { mapValues } from "/hooks/std/collections.ts";
import { modules, require } from "/modules/stdlib/src/webpack/index.ts";

export type ColorSet = {
	background: {
		base: string;
		highlight: string;
		press: string;
		elevated: {
			base: string;
			highlight: string;
			press: string;
		};
		tinted: {
			base: string;
			highlight: string;
			press: string;
		};
	};
	text: {
		base: string;
		subdued: string;
		brightAccent: string;
		negative: string;
		warning: string;
		positive: string;
		announcement: string;
	};
	essential: {
		base: string;
		subdued: string;
		brightAccent: string;
		negative: string;
		warning: string;
		positive: string;
		announcement: string;
	};
	decorative: {
		base: string;
		subdued: string;
	};
};

export type ColorSets =
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

export type ColorTheme = {
	[key in ColorSets]: ColorSet;
};

const [PaletteModuleID] = modules.find(([, m]) => m.toString().includes('"Invalid hexadecimal color input"'))!;
const PaletteModule = require(PaletteModuleID);
const PaletteExports = Object.values(PaletteModule);

export const appliedColorTheme = PaletteExports.find((e) => e?.base?.background?.base) as ColorTheme;
export const defaultColorTheme = mapValues(appliedColorTheme, (colorSet) => ({ ...colorSet })); // copied two levels deep

export const generateColorSet = PaletteExports.find((e) =>
	/return{background:{base:[a-zA-Z_\$][\w\$]*\.toUpperCase\(\),/.test(e)
) as (primaryHex: string, secondaryHex?: string) => ColorSet;

export const toCssAttributes = PaletteExports.find((e) => e.toString().includes('" !important;\\n    "')) as (
	palette: ColorSet,
) => string[];

export const toCssClassName = PaletteExports.find((e) =>
	e.toString().includes('"encore-"') && e.toString().includes('"-set"')
) as (set: string) => string;
