import { React } from "/modules/official/stdlib/src/expose/React.js";
// updates state using latest updater if updater changed or if update is called
export const useUpdate = (updater)=>{
    const [state, setState] = React.useState(updater);
    const updateState = React.useCallback(()=>setState(updater), [
        updater
    ]);
    React.useEffect(updateState, [
        updateState
    ]);
    return [
        state,
        setState,
        updateState
    ];
};
