import { React } from "/modules/stdlib/src/expose/React.ts";

export function createContext<A>(def: A) {
	let ctx: React.Context<A> | null = null;
	return function () {
		return ctx ??= React.createContext(def);
	};
}
