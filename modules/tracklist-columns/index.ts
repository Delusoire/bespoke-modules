import { IndexLoadFn, IndexMixinFn, IndexPreloadFn } from "/hooks/module.ts";

export const mixin: IndexMixinFn = async (tr) => {
	return await (await import("./mix.ts")).default(tr);
};

export const preload: IndexPreloadFn = async (mod) => {
	const { exports } = await import("/modules/stdlib/src/webpack/index.ts");
	await CHUNKS.xpui.promise;
	const [m, k, v] = exports
		.flatMap((m) => {
			const keys = Object.keys(m);
			for (const k of keys) {
				const v = m[k];
				if (typeof v !== "function") {
					continue;
				}
				const s = v.toString();
				if (
					!/\(\{columnType:[a-zA-Z_\$][\w\$]*,visible:(?:[^,}]+),toggleable:(?:[^,}]+),/
						.test(s)
				) {
					continue;
				}
				return [[m, k, v]];
			}
			return [];
		})[0];

	if (!v[Symbol.for("patched")]) {
		const patchedTracklistColumnsProvider = function (props: any) {
			return v({
				...props,
				columns: globalThis.__patchTracklistColumnsProvider(
					props.columns,
				),
			});
		};

		Object.defineProperty(m, k, {
			enumerable: true,
			get: () => patchedTracklistColumnsProvider,
		});
		v[Symbol.for("patched")] = true;
	}
};

export const load: IndexLoadFn = async (mod) => {
	return await (await import("./mod.tsx")).default(mod);
};
