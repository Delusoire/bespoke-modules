import { Snackbar } from "/modules/stdlib/src/expose/Snackbar.ts";
import { chunk } from "/hooks/std/collections.ts";

type async = {
	<A, B>(f: (a: A) => Promise<B>): (fa: Promise<A>) => Promise<B>;
	<A, B>(f: (a: A) => B): (fa: Promise<A>) => Promise<B>;
};
export const pMchain: async = <A, R>(f: (a: A) => R) => async (fa: A) =>
	f(await fa);

export const chunkify = async <A, R>(args: Array<A>, fn: (a: Array<A>) => Promise<Array<R>>, n: number): Promise<R[]> => {
	const a = await Promise.all(chunk(args, n).map(fn));
	return a.flat();
};

export const progressify = async <PS extends Array<Promise<any>>>(ps: PS) => {
	const n = ps.length;
	let i = 0;
	const epsilon = 0.005;
	const step = Math.ceil(epsilon * n);

	const update = () => {
		if (i++ % step !== 0) {
			return;
		}

		const progress = Math.round((++i / ps.length) * 100);
		(Snackbar as any).updater.enqueueSetState(Snackbar, () => ({
			snacks: [],
			queue: [],
		}));
		Snackbar.enqueueSnackbar(`Loading: ${progress}%`, {
			variant: "default",
			autoHideDuration: 200,
			transitionDuration: {
				enter: 0,
				exit: 0,
			},
		});
	};

	await Promise.all(ps.map((p) => p.then(update)));
};

type AsyncFunction = (...args: any[]) => Promise<any>;

export const getConcurrentExecutionLimiterWrapper =
	(limit: number) => <F extends AsyncFunction>(task: F): F => {
		const waitingQ = new Set<() => void>();
		const executingQ = new Set<() => void>();
		return async function () {
			const { promise, resolve } = Promise.withResolvers<void>();
			if (executingQ.size >= limit) {
				waitingQ.add(resolve);
				await promise;
				waitingQ.delete(resolve);
			}

			executingQ.add(resolve);
			return await task(...arguments).finally(() => {
				executingQ.delete(resolve);
				waitingQ.keys().next().value?.();
			});
		} as unknown as F;
	};
