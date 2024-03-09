import { S } from "/modules/Delusoire/std/index.js";
const { React } = S;
export function useObservable(observableFactory, arg2, arg3) {
    // Resolve vars from overloading variants of this function:
    let deps;
    let defaultResult;
    if (typeof observableFactory === "function") {
        deps = arg2 || [];
        defaultResult = arg3;
    }
    else {
        deps = [];
        defaultResult = arg2;
    }
    // Create a ref that keeps the state we need
    const monitor = React.useRef({
        hasResult: false,
        result: defaultResult,
        error: null,
    });
    // We control when component should rerender. Make triggerUpdate
    // as examplified on React's docs at:
    // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
    const [_, triggerUpdate] = React.useReducer(x => x + 1, 0);
    // Memoize the observable based on deps
    const observable = React.useMemo(() => {
        // Make it remember previous subscription's default value when
        // resubscribing.
        const observable = typeof observableFactory === "function" ? observableFactory() : observableFactory;
        if (!observable || typeof observable.subscribe !== "function") {
            if (observableFactory === observable) {
                throw new TypeError("Given argument to useObservable() was neither a valid observable nor a function.");
            }
            throw new TypeError("Observable factory given to useObservable() did not return a valid observable.");
        }
        if (!monitor.current.hasResult &&
            typeof window !== "undefined" // Don't do this in SSR
        ) {
            // Optimize for BehaviorSubject and other observables implementing getValue():
            if (typeof observable.hasValue !== "function" || observable.hasValue()) {
                if (typeof observable.getValue === "function") {
                    monitor.current.result = observable.getValue();
                    monitor.current.hasResult = true;
                }
                else {
                    // Find out if the observable has a current value: try get it by subscribing and
                    // unsubscribing synchronously
                    const subscription = observable.subscribe(val => {
                        monitor.current.result = val;
                        monitor.current.hasResult = true;
                    });
                    // Unsubscribe directly. We only needed any synchronous value if it was possible.
                    if (typeof subscription === "function") {
                        subscription();
                    }
                    else {
                        subscription.unsubscribe();
                    }
                }
            }
        }
        return observable;
    }, deps);
    // Integrate with react devtools:
    React.useDebugValue(monitor.current.result);
    // Subscribe to the observable
    React.useEffect(() => {
        const subscription = observable.subscribe(val => {
            const { current } = monitor;
            if (current.error !== null || current.result !== val) {
                current.error = null;
                current.result = val;
                current.hasResult = true;
                triggerUpdate();
            }
        }, err => {
            const { current } = monitor;
            if (current.error !== err) {
                current.error = err;
                triggerUpdate();
            }
        });
        return typeof subscription === "function"
            ? subscription // Support observables that return unsubscribe directly
            : subscription.unsubscribe.bind(subscription);
    }, deps);
    // Throw if observable has emitted error so that
    // an ErrorBoundrary can catch it
    if (monitor.current.error)
        throw monitor.current.error;
    // Return the current result
    return monitor.current.result;
}
