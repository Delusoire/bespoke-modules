import {
	EntityContext,
	Serializable,
	serializableEntityMixin,
	Serialized,
	SerializedEntity,
} from "./entity.ts";
import { storage } from "./preload.ts";

const LS_ACTIVE_CONFIGLETS = "active_configlets";
const LS_CONFIGLETS = "configlets";

type TwoUplet<T> = [T, T];

type SerializedConfigData = string;
export class Config implements Serializable<SerializedConfigData> {
	constructor(private config: string) {}

	getCSS() {
		return this.config;
	}

	toJSON(): SerializedConfigData {
		return this.config;
	}

	static fromJSON(json: SerializedConfigData) {
		const config = json;
		return new Config(config);
	}

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
	configlets = new Map<string, Configlet>();
	private active = new Set<Configlet>();
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
			this.configlets.set(palette.id, palette);
		}

		const paletteId: string[] | null = JSON.parse(storage.getItem(LS_ACTIVE_CONFIGLETS) ?? "[]");
		for (const id of paletteId ?? []) {
			const configlet = this.configlets.get(id) ?? null;
			if (configlet) {
				this.toggleActive(configlet);
			}
		}
	}

	public getConfiglets(): Configlet[] {
		return Array.from(this.configlets.values());
	}

	public save(): void {
		storage.setItem(LS_CONFIGLETS, JSON.stringify(this.getConfiglets()));
	}

	public getActive(): Configlet[] {
		return Array.from(this.active);
	}

	public toggleActive(configlet: Configlet) {
		if (this.active.has(configlet)) {
			this.active.delete(configlet);
		} else {
			this.active.add(configlet);
		}
		this.applyActive();
		return configlet;
	}

	public async applyActive() {
		const css = this.getActive().map((c) => c.data.getCSS()).join("\n");

		await this.stylesheet.replace(css);

		this.saveActive();
	}

	public saveActive() {
		const ids = Array.from(this.active).map((c) => c.id);
		storage.setItem(LS_ACTIVE_CONFIGLETS, JSON.stringify(ids));
	}

	public addConfiglet(configlet: Configlet) {
		this.configlets.set(configlet.id, configlet);
		this.save();
	}

	public deleteConfiglet(configlet: Configlet) {
		this.configlets.delete(configlet.id);
		if (this.isActive(configlet)) {
			this.toggleActive(configlet);
		}
		this.save();
	}

	public renamePalette(configlet: Configlet, name: string) {
		configlet.name = name;
		this.save();
	}

	public isActive(configlet: Configlet) {
		return this.active.has(configlet);
	}

	public dispose() {
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== this.stylesheet);
	}
}
