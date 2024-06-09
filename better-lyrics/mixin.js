import { React } from "/modules/official/stdlib/src/expose/React.js";
globalThis.__renderCinemaLyrics = ()=>undefined;
export default function(transformer) {
    transformer((emit)=>(str)=>{
            str = str.replace(/(className:[a-zA-Z_\$][\w\$]*\.Content,children:\(0,[a-zA-Z_\$][\w\$]*\.jsxs?\))\([^\)]*\)(?=[^;]*"No container found for cinema video!")/, "$1(__renderCinemaLyrics, {})");
            emit();
            return str;
        }, {
        glob: /^\/xpui\.js$/
    });
}
