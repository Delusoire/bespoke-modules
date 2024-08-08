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

export type Deps = Map<ModuleIdentifier, Set<Version>>;

export function getStaticDeps() {
	const deps: Deps = new Map();
	for (const moduleInstance of RootModule.INSTANCE.getDescendantsByDepth()) {
		const enabledInstance = moduleInstance.getEnabledInstance();
		if (!enabledInstance) {
			continue;
		}
		if (!setDepsModuleVersions(deps, moduleInstance.getIdentifier(), [enabledInstance.getVersion()])) {
			throw new Error("couldn't set deps");
		}
	}
	return deps;
}

export function setDepsModuleVersions(
	deps: Deps,
	moduleIdentifier: ModuleIdentifier,
	versions: Version[],
) {
	const d1 = new Set(versions);
	const d2 = deps.get(moduleIdentifier);
	let d = d1;
	if (d2) {
		d = d2.intersection(d1);
	}
	if (d.size === 0) {
		return false;
	}
	deps.set(moduleIdentifier, d);
	return true;
}

export async function* getModulesVersionsObjectsCandidates(
	moduleIdentifier: ModuleIdentifier,
	versionRange: string,
	deps: Deps = new Map(),
): AsyncGenerator<Set<ModuleInstance>> {
	for await (
		const entries of getModulesVersionsTreesCandidates(
			moduleIdentifier,
			versionRange,
			deps,
		)
	) {
		yield new Set(entries.reverse());
	}
}

export async function* getModulesVersionsTreesCandidates(
	moduleIdentifier: ModuleIdentifier,
	versionRange: string,
	deps: Deps = new Map(),
): AsyncGenerator<Array<ModuleInstance>> {
	const module = RootModule.INSTANCE.getDescendant(moduleIdentifier);
	const versions = Array
		.from(module?.instances.keys() ?? [])
		.filter((version) => satisfies(version, versionRange));

	for (const version of versions) {
		const instance = module!.instances.get(version)!;

		if (!await ensureModuleInstanceMetadata(instance)) {
			continue;
		}

		const _deps = new Map(deps);
		if (!setDepsModuleVersions(_deps, module!.getIdentifier(), [version])) {
			continue;
		}

		const gens = Object
			.entries(
				instance.metadata!.dependencies as Record<ModuleIdentifier, string>,
			)
			.map(([depModuleIdentifier, depVersionRange]) => {
				return getModulesVersionsTreesCandidates(depModuleIdentifier, depVersionRange, _deps);
			});

		for await (const comb of getCombinationsFromGenerators(...gens)) {
			yield [instance, ...comb.flat()];
		}
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
