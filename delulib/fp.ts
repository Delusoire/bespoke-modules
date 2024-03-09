import { _ } from "/modules/Delusoire/std/deps.js";
import { S } from "/modules/Delusoire/std/index.js";

const { Snackbar } = S;

type async = {
	<A, B>(f: (a: A) => Promise<B>): (fa: Promise<A>) => Promise<B>;
	<A, B>(f: (a: A) => B): (fa: Promise<A>) => Promise<B>;
};
export const pMchain: async =
	<A, R>(f: (a: A) => R) =>
	async (fa: A) =>
		f(await fa);

export const chunkifyN =
	(n: number) =>
	<A, R>(fn: (a: Array<A>) => R) =>
	async (args: Array<A>) => {
		const a = await Promise.all(_(args).chunk(n).map(fn).value());
		return a.flat();
	};

export const chunkify50 = chunkifyN(50);
export const chunkify20 = chunkifyN(20);

export const progressify = <F extends (...args: any) => any>(f: F, n: number) => {
	let i = n;
	let lastProgress = 0;
	return async (..._: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
		const res = (await f(...arguments)) as Awaited<ReturnType<F>>;
		const progress = Math.round((1 - --i / n) * 100);
		if (progress > lastProgress) {
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
		}
		lastProgress = progress;
		return res;
	};
};

export type OneUplet<E> = [E];
export type TwoUplet<E> = [E, E];
export type Triplet<E> = [E, E, E];
export type Quadruplet<E> = [E, E, E, E];
export const zip_n_uplets =
	<R>(n: number) =>
	<A>(a: A[]) =>
		a.map((_, i, a) => a.slice(i, i + n)).slice(0, 1 - n) as R[];
