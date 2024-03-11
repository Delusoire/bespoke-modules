export default function(registerTransform) {
    registerTransform({
        transform: (emit)=>(str)=>{
                emit();
                return str;
            },
        glob: /^\/xpui\.js/
    });
}
