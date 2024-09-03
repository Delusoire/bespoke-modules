import type { Schemer } from "./schemer.ts";
import { type ModuleIdentifier, RootModule } from "/hooks/module.ts";

import { startCase } from "/modules/stdlib/deps.ts";

export interface Serializable<T extends {} = any> {
	toJSON(): T;
}

export type Serialized<S> = S extends Serializable<infer J> ? J : never;

export type SerializedEntityContext = {
	module: string;
	id: string;
};
export class EntityContext implements Serializable<SerializedEntityContext> {
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

	static fromJSON<C extends typeof EntityContext>(this: C, json: SerializedEntityContext): InstanceType<C> {
		return new this(json.module, json.id) as InstanceType<C>;
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

export type SerializableEntity = ReturnType<typeof serializableEntityMixin>;
export const serializableEntityMixin = <Data extends Serializable, Context extends EntityContext>(
	dataCtor: DataCTor<Data>,
	contextCtor: ContextCTor<Context>,
	schemer: typeof Schemer,
) => (class SerializableEntity extends Entity<Context, Data>
	implements Serializable<SerializedEntity<Entity<Context, Data>>> {
	public static Context = contextCtor;
	public static Data = dataCtor;

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

	reset() {
		const palette = this.context ? schemer.get(this.context) as SerializableEntity | null : null;

		this.data = palette ? dataCtor.fromJSON(palette.data.toJSON()) : dataCtor.createDefault();
	}

	static fromJSON<Ctor extends typeof SerializableEntity>(
		this: Ctor,
		json: SerializedEntity<SerializableEntity>,
	): InstanceType<Ctor> {
		let context: Context | null = null;
		if (json.context) {
			context = contextCtor.fromJSON(json.context);
		}

		return new this(
			json.id,
			json.name,
			dataCtor.fromJSON(json.data),
			context,
		) as InstanceType<Ctor>;
	}

	static create<Ctor extends typeof SerializableEntity>(
		this: Ctor,
		name: string,
		theme: Data,
		context: Context | null = null,
	): InstanceType<Ctor> {
		return new this(crypto.randomUUID(), name, theme, context) as InstanceType<Ctor>;
	}

	static createDefault<Ctor extends typeof SerializableEntity>(
		this: Ctor,
		name?: string,
		context: Context | null = null,
	): InstanceType<Ctor> {
		const palette = context ? schemer.get(context) as SerializableEntity | null : null;

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

		return this.create(name, data, context) as InstanceType<Ctor>;
	}
});

interface EntityCtor<E extends Entity<any, any>> {
	new (...args: any[]): E;
}

export type EntityOfManager<M extends EntityManager<any>> = M extends EntityManager<infer E> ? E : never;

export abstract class EntityManager<E extends Entity<any, any>> {
	public static Entity: EntityCtor<Entity<any, any>>;

	entities = new Map<string, E>();
	active = new Set<E>();
	stylesheet = new CSSStyleSheet();

	constructor() {
		document.adoptedStyleSheets.push(this.stylesheet);
	}

	public getAll(): E[] {
		return Array.from(this.entities.values());
	}

	public abstract save(entity: E): void;
	public abstract unsave(entity: E): void;

	public getAllActive(): E[] {
		return Array.from(this.active);
	}

	public toggleActive(entity: E, only = false) {
		if (this.active.has(entity)) {
			this.active.delete(entity);
		} else {
			if (only) {
				this.active.clear();
			}
			this.active.add(entity);
		}
		this.applyActive();
		return entity;
	}

	public abstract applyActive(): Promise<void>;

	public abstract saveActive(): Promise<void>;

	public add(entity: E) {
		this.entities.set(entity.id, entity);
		this.save(entity);
	}

	public delete(entity: E) {
		this.entities.delete(entity.id);
		if (this.isActive(entity)) {
			this.toggleActive(entity);
		}
		this.unsave(entity);
	}

	public rename(entity: E, name: string) {
		entity.name = name;
		this.save(entity);
	}

	public isActive(entity: E) {
		return this.active.has(entity);
	}

	public dispose() {
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== this.stylesheet);
	}
}
