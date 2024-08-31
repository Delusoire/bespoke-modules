import { ModuleIdentifier, RootModule } from "/hooks/module.ts";

export type SerializedEntityContext = {
	module: string;
	id: string;
};
export class EntityContext {
	constructor(public module: ModuleIdentifier, public id: string) {}

	getModuleInstance() {
		return RootModule.INSTANCE.getDescendant(this.module)?.getEnabledInstance() ?? null;
	}

	toJSON(): SerializedEntityContext {
		return {
			module: this.module,
			id: this.id,
		};
	}

	static fromJSON(json: SerializedEntityContext) {
		return new EntityContext(json.module, json.id);
	}

	equals(other: EntityContext) {
		return this.module === other.module && this.id === other.id;
	}
}

export class Entity<C extends EntityContext> {
	constructor(public id: string, public name: string, public context: C | null) {}
}
