import { React } from "/modules/official/stdlib/src/expose/React.js";
globalThis.__patchTracklistWrapperProps = (x)=>{
    React.useCallback(()=>null, []);
    return x;
};
globalThis.__patchRenderTracklistRowColumn = ()=>null;
globalThis.__patchTracklistColumnHeaderContextMenu = ()=>()=>undefined;
globalThis.__patchTracklistColumns = (x)=>x;
export default function(transformer) {
    transformer((emit)=>(str)=>{
            str = str.replace(/(tracks,[^;]*nrTracks),/, "$1,e=__patchTracklistWrapperProps(e),");
            str = str.replaceAll(/(switch\(([a-zA-Z_\$][\w\$]*)\){case [a-zA-Z_\$][\w\$]*\.[a-zA-Z_\$][\w\$]*\.INDEX:.*?default):/g, "$1:return __patchRenderTracklistRowColumn($2);");
            str = str.replace(/([a-zA-Z_\$][\w\$]*)=([a-zA-Z_\$][\w\$]*)\[([a-zA-Z_\$][\w\$]*)\],(?=.*\.jsxs?\)\(\1,[^;]*columnIndex:)/, "$1=$2[$3]??__patchTracklistColumnHeaderContextMenu($3),");
            str = str.replace(/=e\.columns,(.{0,100}),toggleable:([^,}]+)/, "=__patchTracklistColumns(e.columns),$1,toggleable:$2??true");
            emit();
            return str;
        }, {
        glob: /^\/xpui\.js$/
    });
}
