import { satisfies } from "/hooks/semver/satisfies.ts";
import { type ModuleIdentifier, type ModuleInstance, RootModule, type Version } from "/hooks/module.ts";

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

export type Deps = Map<ModuleIdentifier, Set<ModuleInstance>>;

export function getStaticDeps() {
	const deps: Deps = new Map();
	for (const moduleInstance of RootModule.INSTANCE.getDescendantsByDepth()) {
		const enabledInstance = moduleInstance.getEnabledInstance();
		if (!enabledInstance) {
			continue;
		}
		if (
			!accumulateInstanceDependencies(deps, enabledInstance)
		) {
			throw new Error("couldn't set deps");
		}
	}
	return deps;
}

export function accumulateInstanceDependencies(
	accumulator: Deps,
	...instances: ModuleInstance[]
) {
	const instancesByModuleIdentifier = Object.groupBy(instances, (instance) => instance.getModuleIdentifier());
	for (const [moduleIdentifier, instances] of Object.entries(instancesByModuleIdentifier)) {
		const d1 = new Set(instances);
		const d2 = accumulator.get(moduleIdentifier) ?? d1;
		const d = d1.intersection(d2);
		if (d.size === 0) {
			return false;
		}
		accumulator.set(moduleIdentifier, d);
	}
	return true;
}

export async function* getModulesDependencyListCandidates(
	moduleIdentifier: ModuleIdentifier,
	versionRange: string,
	accumulator: Deps = new Map(),
): AsyncGenerator<Set<ModuleInstance>> {
	for await (
		const entries of getModulesDependencyTreeCandidates({ [moduleIdentifier]: versionRange }, accumulator)
	) {
		yield new Set(entries.flat(Infinity).reverse());
	}
}

type DependencyTree = [ModuleInstance, ...DependencyTree[]];

export async function* getModulesDependencyTreeCandidates(
	dependencies: Record<ModuleIdentifier, string>,
	accumulator: Deps = new Map(),
): AsyncGenerator<[...DependencyTree[]]> {
	const gens = Object
		.entries(dependencies)
		.map(async function* ([moduleIdentifier, versionRange]) {
			const module = RootModule.INSTANCE.getDescendant(moduleIdentifier);
			const versions = Array
				.from(module?.instances.keys() ?? [])
				.filter((version) => satisfies(version, versionRange));

			for (const version of versions) {
				const instance = module!.instances.get(version)!;

				if (!(await ensureModuleInstanceMetadata(instance))) {
					continue;
				}

				const acc = new Map(accumulator);
				if (!accumulateInstanceDependencies(acc, instance)) {
					continue;
				}

				for await (
					const candidate of getModulesDependencyTreeCandidates(instance.metadata!.dependencies, acc)
				) {
					yield [instance, ...candidate] as const;
				}
			}
		});

	for await (const comb of getCombinationsFromGenerators(...gens)) {
		const accumulator: Deps = new Map();

		for (const dependencyTree of comb) {
			const dependencyList = dependencyTree.flat(Infinity) as ModuleInstance[];
			if (!accumulateInstanceDependencies(accumulator, ...dependencyList)) {
				continue;
			}
		}

		yield comb as [...DependencyTree[]];
	}
}

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
