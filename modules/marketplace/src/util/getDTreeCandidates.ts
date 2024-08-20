import { Module, type ModuleIdentifier, type ModuleInstance, RootModule } from "/hooks/module.ts";
import { satisfies } from "/hooks/semver/satisfies.ts";

async function ensureModuleInstanceMetadata(instance: ModuleInstance) {
	if (!instance.isEnabled()) {
		try {
			await instance.ensureMetadata();
		} catch (e) {
			console.error(e);
			return false;
		}
	}
	return true;
}

//

export class ReadonlyDeps extends Map<ModuleIdentifier, ReadonlySet<ModuleInstance>>
	implements ReadonlyMap<ModuleIdentifier, ReadonlySet<ModuleInstance>> {
	intersectionTo(other: ReadonlyDeps) {
		const deps = new Deps(this);
		if (!deps.intersection(other)) {
			return null;
		}
		return deps;
	}

	differenceTo(other: ReadonlyDeps) {
		const deps = new Deps(this);
		if (!deps.difference(other)) {
			return null;
		}
		return deps;
	}

	accumulateTo(...instances: ModuleInstance[]) {
		const deps = new Deps(this);
		if (!deps.accumulate(...instances)) {
			return null;
		}
		return deps;
	}
}

export class Deps extends ReadonlyDeps implements Map<ModuleIdentifier, ReadonlySet<ModuleInstance>> {
	intersection(other: ReadonlyDeps) {
		for (const [moduleIdentifier, sourceInstances] of other) {
			const targetInstances = this.get(moduleIdentifier) ?? sourceInstances;
			const commonInstances = sourceInstances.intersection(targetInstances);
			if (commonInstances.size === 0) {
				return false;
			}
			this.set(moduleIdentifier, commonInstances);
		}
		return true;
	}

	difference(other: ReadonlyDeps) {
		for (const [moduleIdentifier, targetInstances] of this) {
			const sourceInstances = other.get(moduleIdentifier) ?? targetInstances;
			const targetOnlyInstances = targetInstances.difference(sourceInstances);
			if (targetOnlyInstances.size === 0) {
				this.delete(moduleIdentifier);
			} else {
				this.set(moduleIdentifier, targetOnlyInstances);
			}
		}
		return true;
	}

	accumulate(...instances: ModuleInstance[]) {
		const instancesByModuleIdentifier = Object.groupBy(
			instances,
			(instance) => instance.getModuleIdentifier(),
		);
		for (const [moduleIdentifier, instances] of Object.entries(instancesByModuleIdentifier)) {
			const d1 = new Set(instances);
			const d2 = this.get(moduleIdentifier) ?? d1;
			const d = d1.intersection(d2);
			if (d.size === 0) {
				return false;
			}
			this.set(moduleIdentifier, d);
		}
		return true;
	}
}

export function getEnabledDeps() {
	const deps = new Deps();
	for (const moduleInstance of RootModule.INSTANCE.getDescendantsByDepth()) {
		const enabledInstance = moduleInstance.getEnabledInstance();
		if (!enabledInstance) {
			continue;
		}
		if (!deps.accumulate(enabledInstance)) {
			throw new Error("couldn't set deps");
		}
	}
	return deps;
}

export function getModuleDeps(module: Module) {
	const deps = new Deps();
	if (!deps.accumulate(...module.instances.values())) {
		throw new Error("couldn't set deps");
	}
	return deps;
}

//

export type SharedIntanceGeneratorFactories = WeakMap<ModuleInstance, AsyncGeneratorFactory<DependencyTree>>;

//

export type DependencyTree = [ModuleInstance, ...DependencyTree[]];

export function flattenDTrees(
	dependencyTrees: DependencyTree | DependencyTree[],
) {
	return new Set((dependencyTrees.flat(Infinity) as ModuleInstance[]).reverse());
}

//

async function* getModuleInstances(
	moduleIdentifier: ModuleIdentifier,
	versionRange: string,
): AsyncGenerator<ModuleInstance> {
	const module = RootModule.INSTANCE.getDescendant(moduleIdentifier);
	const versions = Array
		.from(module?.instances.keys() ?? [])
		.filter((version) => satisfies(version, versionRange));

	for (const version of versions) {
		yield module!.instances.get(version)!;
	}
}

async function* getInstanceGenInstanceDTreeCandidates(
	instanceGen: AsyncGenerator<ModuleInstance>,
	accumulator: ReadonlyDeps,
	sigfs: SharedIntanceGeneratorFactories,
): AsyncGenerator<DependencyTree> {
	for await (const instance of instanceGen) {
		yield* getInstanceDTreeCandidates(instance, accumulator, sigfs);
	}
}

export async function* getModuleDTreeCandidates(
	moduleIdentifier: ModuleIdentifier,
	versionRange: string,
	accumulator = new ReadonlyDeps(),
	sigfs: SharedIntanceGeneratorFactories = new WeakMap(),
): AsyncGenerator<DependencyTree> {
	const instanceGen = getModuleInstances(moduleIdentifier, versionRange);
	yield* getInstanceGenInstanceDTreeCandidates(instanceGen, accumulator, sigfs);
}

export async function* getInstanceDTreeCandidates(
	instance: ModuleInstance,
	accumulator = new ReadonlyDeps(),
	sigfs: SharedIntanceGeneratorFactories = new WeakMap(),
): AsyncGenerator<DependencyTree> {
	if (!(await ensureModuleInstanceMetadata(instance))) {
		return;
	}

	const _accumulator = accumulator.accumulateTo(instance);
	if (!_accumulator) {
		return;
	}

	async function* _getInstanceDTreeCandidates(
		instance: ModuleInstance,
		accumulator: ReadonlyDeps,
		sigfs: SharedIntanceGeneratorFactories,
	) {
		for await (
			const candidate of getDependenciesDTreeCandidates(instance.metadata!.dependencies, accumulator, sigfs)
		) {
			yield [instance, ...candidate] as const as DependencyTree;
		}
	}

	let sigf = sigfs.get(instance);
	if (!sigf) {
		sigf = createSharedGeneratorFactory(_getInstanceDTreeCandidates(instance, accumulator, sigfs));
		sigfs.set(instance, sigf);
	}

	for await (const candidate of sigf()) {
		if (_accumulator.accumulateTo(...candidate.flat(Infinity) as ModuleInstance[])) {
			yield candidate;
		}
	}
}

export async function* getDependenciesDTreeCandidates(
	dependencies: Record<ModuleIdentifier, string>,
	accumulator = new ReadonlyDeps(),
	sigfs: SharedIntanceGeneratorFactories = new WeakMap(),
): AsyncGenerator<DependencyTree[]> {
	const instanceGens = Object
		.entries(dependencies)
		.map(([moduleIdentifier, versionRange]) => (getModuleInstances(moduleIdentifier, versionRange)));

	yield* getInstanceGensDTreeCandidates(instanceGens, accumulator, sigfs);
}

export async function* getInstanceGensDTreeCandidates(
	instanceGens: Array<AsyncGenerator<ModuleInstance>>,
	accumulator = new ReadonlyDeps(),
	sigfs: SharedIntanceGeneratorFactories = new WeakMap(),
): AsyncGenerator<DependencyTree[]> {
	const gens = instanceGens.map(async function* (instanceGen) {
		yield* getInstanceGenInstanceDTreeCandidates(instanceGen, accumulator, sigfs);
	});

	for await (const comb of getCombinationsFromGenerators(...gens)) {
		yield_comb: {
			const accumulator = new Deps();

			for (const dependencyTree of comb) {
				const dependencyList = dependencyTree.flat(Infinity) as ModuleInstance[];
				if (!accumulator.accumulate(...dependencyList)) {
					break yield_comb;
				}
			}

			yield comb;
		}
	}
}

//

async function* getCombinationsFromGenerators<T>(...gens: Array<AsyncGenerator<T>>) {
	const values = new Array(gens.length) as Array<Array<T>>;

	for (let i = 0; i < gens.length; i++) {
		const result = await gens[i].next();
		if (result.done) return;
		values[i] = [result.value];
	}
	yield values.map((gen) => gen[0]);

	const doneGens = new Set<AsyncGenerator>();
	for (let i = 0; doneGens.size === gens.length; i = (i + 1) % gens.length) {
		if (doneGens.has(gens[i])) continue;

		const result = await gens[i].next();
		if (result.done) {
			doneGens.add(gens[i]);
			continue;
		}

		yield* getCombinationsFromArrays(...values.toSpliced(i, 1, [result.value]));

		values[i].push(result.value);
	}
}

function* getCombinationsFromArrays<T>(
	...arrays: Array<Array<T>>
): Generator<Array<T>> {
	if (arrays.some((arr) => arr.length === 0)) return;
	const indicies = new Array(arrays.length).fill(0);
	yield arrays.map((arr, i) => arr[indicies[i]]);

	let doneCount = 0;
	for (let i = 0; doneCount === arrays.length; i = (i + 1) % arrays.length) {
		if (indicies[i] === arrays[i].length) continue;

		if (++indicies[i] === arrays[i].length) {
			doneCount++;
			continue;
		}

		yield* getCombinationsFromArrays(
			...arrays.map((arr, j) => i === j ? [arr[indicies[j]]] : arr.slice(0, indicies[j] + 1)),
		);
	}
}

type AsyncGeneratorFactory<T> = () => AsyncGenerator<T>;

function createSharedGeneratorFactory<T>(generator: AsyncGenerator<T>): AsyncGeneratorFactory<Awaited<T>> {
	const cache: T[] = [];
	async function next(index: number) {
		if (index === cache.length) {
			const result = await generator.next();
			if (result.done) return -1;
			cache.push(result.value);
		}
		return index + 1;
	}

	return async function* () {
		for (let index = 0; (index = await next(index)) >= 0;) {
			yield cache[index - 1];
		}
	};
}
