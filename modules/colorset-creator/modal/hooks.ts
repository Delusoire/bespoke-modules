import { React } from "/modules/stdlib/src/expose/React.ts";

export const useSyncedState = <S>(externalState: S, onExternalOverride?: (newState: S) => void) => {
	const [, rerender] = React.useReducer((n) => n + 1, 0);

	const externalStateRef = React.useRef(externalState);
	const internalStateRef = React.useRef(externalStateRef.current);

	const setInternalState = React.useCallback((newInternalState: S) => {
		if (internalStateRef.current === newInternalState) {
			return;
		}
		internalStateRef.current = newInternalState;
		rerender();
	}, []);

	if (externalStateRef.current !== externalState) {
		externalStateRef.current = internalStateRef.current = externalState;
		onExternalOverride?.(externalState);
	}

	return [internalStateRef.current, setInternalState] as const;
};

export const useDynamicReducer: typeof React.useReducer = (reducer, initialArg, init) => {
	const reducerRef = React.useRef(reducer);
	reducerRef.current = reducer;

	return React.useReducer(
		(state, action) => reducerRef.current(state, action),
		initialArg,
		init,
	);
};

export const useNext = <T>(options: T[]) => {
	const [active, setActive] = React.useState(0);
	const next = React.useCallback(() => setActive((active) => (active + 1) % options.length), [options.length]);
	return [options[active], next] as const;
};
