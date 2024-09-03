import { EntityManager, Serializable, serializableEntityMixin, SerializedEntity } from "./entity.ts";
import { storage } from "../preload.ts";
import { ConfigletContext, Schemer } from "./schemer.ts";

const LS_ACTIVE_CONFIGLETS = "active_configlets";
const LS_CONFIGLETS = "configlets";

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

export interface Configlet {
	Context: ConfigletContext;
}
export class Configlet extends serializableEntityMixin(Config, ConfigletContext, Schemer) {}

export class ConfigletManager extends EntityManager<Configlet> {
	public static override Entity = Configlet;
	public static INSTANCE = new ConfigletManager();

	_init() {
		const configletIds: string[] = JSON.parse(storage.getItem(LS_CONFIGLETS) ?? "[]");
		const serializedConfiglets: SerializedEntity<Configlet>[] = configletIds
			.map((id) => JSON.parse(storage.getItem(LS_CONFIGLETS + ":" + id) ?? "null"))
			.filter(Boolean);
		const configlets = serializedConfiglets.map((json) => Configlet.fromJSON(json));
		for (const configlet of configlets) {
			this.entities.set(configlet.id, configlet);
		}

		const activeConfigletIds: string[] = JSON.parse(storage.getItem(LS_ACTIVE_CONFIGLETS) ?? "[]");
		for (const id of activeConfigletIds) {
			const configlet = this.entities.get(id) ?? null;
			if (configlet) {
				this.toggleActive(configlet);
			}
		}
	}

	public override save(configlet: Configlet): void {
		storage.setItem(LS_CONFIGLETS + ":" + configlet.id, JSON.stringify(configlet));
	}

	public override unsave(configlet: Configlet): void {
		storage.removeItem(LS_CONFIGLETS + ":" + configlet.id);
	}

	public override async applyActive() {
		const css = this.getAllActive().map((c) => c.data.getCSS()).join("\n");

		await this.stylesheet.replace(css);

		this.saveActive();
	}

	public override async saveActive() {
		const ids = Array.from(this.active).map((c) => c.id);
		storage.setItem(LS_ACTIVE_CONFIGLETS, JSON.stringify(ids));
	}
}
