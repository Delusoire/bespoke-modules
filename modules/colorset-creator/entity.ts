import { startCase } from "/modules/stdlib/deps.ts";
import { Schemer } from "./schemer.ts";
import { ModuleIdentifier, RootModule } from "/hooks/module.ts";

export interface Serializable<T extends {} = any> {
	toJSON(): T;
}

export type Serialized<S> = S extends Serializable<infer J> ? J : never;

export type SerializedEntityContext = {
	module: string;
	id: string;
};
export abstract class EntityContext implements Serializable<SerializedEntityContext> {
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

	static fromJSON(json: SerializedEntityContext): unknown {
		// @ts-ignore
		return new this(json.module, json.id);
	}

	equals(other: EntityContext) {
		return this.module === other.module && this.id === other.id;
	}

	toString(): string {
		const id = startCase(this.id);

		const module = this.getModuleInstance();
		if (!module) {
			return id;
		}

		const name = module.getName() ?? module.getIdentifier();
		return `${startCase(name)} - ${id}`;
	}
}

export type DataOfEntity<E extends Entity<any, any>> = E extends Entity<any, infer D> ? D : never;
export type ContextOfEntity<E extends Entity<any, any>> = E extends Entity<infer C, any> ? C : never;

export type SerializedEntity<E extends Entity<any, any>> = {
	id: string;
	name: string;
	data: Serialized<DataOfEntity<E>>;
	context: Serialized<ContextOfEntity<E>> | null;
};

export abstract class Entity<Context, Data> {
	constructor(public id: string, public name: string, public data: Data, public context: Context | null) {}
}

interface DataCTor<Data> {
	new (...args: any[]): Data;
	fromJSON(json: Serialized<Data>): Data;
	createDefault(): Data;
}

interface ContextCTor<Context> {
	new (...args: any[]): Context;
	fromJSON(json: Serialized<Context>): Context;
}

export const serializableEntityMixin = <Data extends Serializable, Context extends EntityContext>(
	dataCtor: DataCTor<Data>,
	contextCtor: ContextCTor<Context>,
) => (class SerializableEntity extends Entity<Context, Data>
	implements Serializable<SerializedEntity<Entity<Context, Data>>> {
	constructor(id: string, name: string, data: Data, context: Context | null) {
		super(id, name, data, context);
	}

	toJSON(): SerializedEntity<SerializableEntity> {
		const context = this.context;

		return {
			id: this.id,
			name: this.name,
			data: this.data.toJSON(),
			context: context ? context.toJSON() as Serialized<Context> : null,
		};
	}

	static fromJSON(json: SerializedEntity<SerializableEntity>) {
		let context: Context | null = null;
		if (json.context) {
			context = contextCtor.fromJSON(json.context);
		}

		return new this(
			json.id,
			json.name,
			dataCtor.fromJSON(json.data),
			context,
		);
	}

	static create(name: string, theme: Data, context: Context | null = null) {
		return new this(crypto.randomUUID(), name, theme, context);
	}

	static createDefault(name?: string, context: Context | null = null) {
		const palette = context ? Schemer.get(context) as SerializableEntity | null : null;

		let data: Data;

		if (palette) {
			name ??= palette.name;
			data = dataCtor.fromJSON(palette.data.toJSON());
		} else {
			if (context) {
				name ??= context.toString();
			} else {
				name ??= "default";
			}
			data = dataCtor.createDefault();
		}

		return this.create(name, data, context);
	}
});