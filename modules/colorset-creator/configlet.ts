import type { ModuleInstance } from "/hooks/module.ts";
import { Color } from "/modules/stdlib/src/webpack/misc.xpui.ts";
import { appliedColorTheme, type ColorSets, type ColorTheme, defaultColorTheme } from "./webpack.ts";
import {
	EntityContext,
	Serializable,
	serializableEntityMixin,
	Serialized,
	SerializedEntity,
} from "./entity.ts";

const LS_ACTIVE_CONFIGLETS = "active_configlets";
const LS_CONFIGLETS = "configlets";

let storage: Storage;
export default function (mod: ModuleInstance) {
	ConfigletManager.INSTANCE._init();
}

type TwoUplet<T> = [T, T];

type SerializedThemeData = Record<ColorSets, TwoUplet<string>>;
export class Config implements Serializable<SerializedThemeData> {
	constructor(private theme: { [key in ColorSets]: TwoUplet<Color> }) {}

	copy() {
		return Config.fromJSON(this.toJSON());
	}

	static createDefault() {
		return Config.fromJSON("");
	}
}

export class ConfigletContext extends EntityContext {
	static override fromJSON(json: Serialized<ConfigletContext>): ConfigletContext {
		return super.fromJSON(json) as ConfigletContext;
	}
}

export class Configlet extends serializableEntityMixin(Config, ConfigletContext) {
	static override fromJSON(json: SerializedEntity<Configlet>): Configlet {
		return super.fromJSON(json);
	}

	static override create(name: string, theme: Config, context?: ConfigletContext | null): Configlet {
		return super.create(name, theme, context);
	}

	static override createDefault(name?: string, context: ConfigletContext | null = null): Configlet {
		return super.createDefault(name, context);
	}
}

export class ConfigletManager {
	public static INSTANCE = new ConfigletManager();
	palettes = new Map<string, Configlet>();
	private palette: Configlet | null = null;
	private stylesheet = new CSSStyleSheet();

	private constructor() {
		document.adoptedStyleSheets.push(this.stylesheet);
	}

	_init() {
		const serializedPalettes: SerializedEntity<Configlet>[] = JSON.parse(
			storage.getItem(LS_CONFIGLETS) ?? "[]",
		);
		const palettes = serializedPalettes.map((json) => Configlet.fromJSON(json));
		for (const palette of palettes) {
			this.palettes.set(palette.id, palette);
		}

		const paletteId: string | null = JSON.parse(storage.getItem(LS_ACTIVE_CONFIGLETS) ?? "null");
		const palette = this.palettes.get(paletteId!) ?? null;
		this.setCurrent(palette);
	}

	public getDefault(): Configlet | null {
		return this.palettes.values().next().value ?? null;
	}

	public getPalettes(): Configlet[] {
		return Array.from(this.palettes.values());
	}

	public save(): void {
		storage.setItem(LS_CONFIGLETS, JSON.stringify(this.getPalettes()));
	}

	public getCurrent(): Configlet | null {
		return this.palette;
	}

	public setCurrent(palette: Configlet | null) {
		this.palette = palette;
		this.applyCurrent();
		return palette;
	}

	public async applyCurrent() {
		let css: string;
		let colorTheme: ColorTheme;

		if (this.palette && this.palette.data) {
			css = this.palette.data.getCSS();
			colorTheme = this.palette.data.getColorTheme();
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
		storage.setItem(LS_ACTIVE_CONFIGLETS, JSON.stringify(this.palette?.id ?? null));
	}

	public addPalette(palette: Configlet) {
		this.palettes.set(palette.id, palette);
		this.save();
	}

	public deletePalette(palette: Configlet) {
		this.palettes.delete(palette.id);
		if (this.isCurrent(palette)) {
			this.setCurrent(null);
		}
		this.save();
	}

	public renamePalette(palette: Configlet, name: string) {
		palette.name = name;
		if (this.isCurrent(palette)) {
			this.saveCurrent();
		}
		this.save();
	}

	public isCurrent(palette: Configlet) {
		return palette.id === this.getCurrent()?.id;
	}

	public dispose() {
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== this.stylesheet);
	}
}
