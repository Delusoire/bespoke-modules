function applyDecs2203RFactory() {
    function createAddInitializerMethod(initializers, decoratorFinishedRef) {
        return function addInitializer(initializer) {
            assertNotFinished(decoratorFinishedRef, "addInitializer");
            assertCallable(initializer, "An initializer");
            initializers.push(initializer);
        };
    }
    function memberDec(dec, name, desc, initializers, kind, isStatic, isPrivate, metadata, value) {
        var kindStr;
        switch(kind){
            case 1:
                kindStr = "accessor";
                break;
            case 2:
                kindStr = "method";
                break;
            case 3:
                kindStr = "getter";
                break;
            case 4:
                kindStr = "setter";
                break;
            default:
                kindStr = "field";
        }
        var ctx = {
            kind: kindStr,
            name: isPrivate ? "#" + name : name,
            static: isStatic,
            private: isPrivate,
            metadata: metadata
        };
        var decoratorFinishedRef = {
            v: false
        };
        ctx.addInitializer = createAddInitializerMethod(initializers, decoratorFinishedRef);
        var get, set;
        if (kind === 0) {
            if (isPrivate) {
                get = desc.get;
                set = desc.set;
            } else {
                get = function() {
                    return this[name];
                };
                set = function(v) {
                    this[name] = v;
                };
            }
        } else if (kind === 2) {
            get = function() {
                return desc.value;
            };
        } else {
            if (kind === 1 || kind === 3) {
                get = function() {
                    return desc.get.call(this);
                };
            }
            if (kind === 1 || kind === 4) {
                set = function(v) {
                    desc.set.call(this, v);
                };
            }
        }
        ctx.access = get && set ? {
            get: get,
            set: set
        } : get ? {
            get: get
        } : {
            set: set
        };
        try {
            return dec(value, ctx);
        } finally{
            decoratorFinishedRef.v = true;
        }
    }
    function assertNotFinished(decoratorFinishedRef, fnName) {
        if (decoratorFinishedRef.v) {
            throw new Error("attempted to call " + fnName + " after decoration was finished");
        }
    }
    function assertCallable(fn, hint) {
        if (typeof fn !== "function") {
            throw new TypeError(hint + " must be a function");
        }
    }
    function assertValidReturnValue(kind, value) {
        var type = typeof value;
        if (kind === 1) {
            if (type !== "object" || value === null) {
                throw new TypeError("accessor decorators must return an object with get, set, or init properties or void 0");
            }
            if (value.get !== undefined) {
                assertCallable(value.get, "accessor.get");
            }
            if (value.set !== undefined) {
                assertCallable(value.set, "accessor.set");
            }
            if (value.init !== undefined) {
                assertCallable(value.init, "accessor.init");
            }
        } else if (type !== "function") {
            var hint;
            if (kind === 0) {
                hint = "field";
            } else if (kind === 10) {
                hint = "class";
            } else {
                hint = "method";
            }
            throw new TypeError(hint + " decorators must return a function or void 0");
        }
    }
    function applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, initializers, metadata) {
        var decs = decInfo[0];
        var desc, init, value;
        if (isPrivate) {
            if (kind === 0 || kind === 1) {
                desc = {
                    get: decInfo[3],
                    set: decInfo[4]
                };
            } else if (kind === 3) {
                desc = {
                    get: decInfo[3]
                };
            } else if (kind === 4) {
                desc = {
                    set: decInfo[3]
                };
            } else {
                desc = {
                    value: decInfo[3]
                };
            }
        } else if (kind !== 0) {
            desc = Object.getOwnPropertyDescriptor(base, name);
        }
        if (kind === 1) {
            value = {
                get: desc.get,
                set: desc.set
            };
        } else if (kind === 2) {
            value = desc.value;
        } else if (kind === 3) {
            value = desc.get;
        } else if (kind === 4) {
            value = desc.set;
        }
        var newValue, get, set;
        if (typeof decs === "function") {
            newValue = memberDec(decs, name, desc, initializers, kind, isStatic, isPrivate, metadata, value);
            if (newValue !== void 0) {
                assertValidReturnValue(kind, newValue);
                if (kind === 0) {
                    init = newValue;
                } else if (kind === 1) {
                    init = newValue.init;
                    get = newValue.get || value.get;
                    set = newValue.set || value.set;
                    value = {
                        get: get,
                        set: set
                    };
                } else {
                    value = newValue;
                }
            }
        } else {
            for(var i = decs.length - 1; i >= 0; i--){
                var dec = decs[i];
                newValue = memberDec(dec, name, desc, initializers, kind, isStatic, isPrivate, metadata, value);
                if (newValue !== void 0) {
                    assertValidReturnValue(kind, newValue);
                    var newInit;
                    if (kind === 0) {
                        newInit = newValue;
                    } else if (kind === 1) {
                        newInit = newValue.init;
                        get = newValue.get || value.get;
                        set = newValue.set || value.set;
                        value = {
                            get: get,
                            set: set
                        };
                    } else {
                        value = newValue;
                    }
                    if (newInit !== void 0) {
                        if (init === void 0) {
                            init = newInit;
                        } else if (typeof init === "function") {
                            init = [
                                init,
                                newInit
                            ];
                        } else {
                            init.push(newInit);
                        }
                    }
                }
            }
        }
        if (kind === 0 || kind === 1) {
            if (init === void 0) {
                init = function(instance, init) {
                    return init;
                };
            } else if (typeof init !== "function") {
                var ownInitializers = init;
                init = function(instance, init) {
                    var value = init;
                    for(var i = 0; i < ownInitializers.length; i++){
                        value = ownInitializers[i].call(instance, value);
                    }
                    return value;
                };
            } else {
                var originalInitializer = init;
                init = function(instance, init) {
                    return originalInitializer.call(instance, init);
                };
            }
            ret.push(init);
        }
        if (kind !== 0) {
            if (kind === 1) {
                desc.get = value.get;
                desc.set = value.set;
            } else if (kind === 2) {
                desc.value = value;
            } else if (kind === 3) {
                desc.get = value;
            } else if (kind === 4) {
                desc.set = value;
            }
            if (isPrivate) {
                if (kind === 1) {
                    ret.push(function(instance, args) {
                        return value.get.call(instance, args);
                    });
                    ret.push(function(instance, args) {
                        return value.set.call(instance, args);
                    });
                } else if (kind === 2) {
                    ret.push(value);
                } else {
                    ret.push(function(instance, args) {
                        return value.call(instance, args);
                    });
                }
            } else {
                Object.defineProperty(base, name, desc);
            }
        }
    }
    function applyMemberDecs(Class, decInfos, metadata) {
        var ret = [];
        var protoInitializers;
        var staticInitializers;
        var existingProtoNonFields = new Map();
        var existingStaticNonFields = new Map();
        for(var i = 0; i < decInfos.length; i++){
            var decInfo = decInfos[i];
            if (!Array.isArray(decInfo)) continue;
            var kind = decInfo[1];
            var name = decInfo[2];
            var isPrivate = decInfo.length > 3;
            var isStatic = kind >= 5;
            var base;
            var initializers;
            if (isStatic) {
                base = Class;
                kind = kind - 5;
                staticInitializers = staticInitializers || [];
                initializers = staticInitializers;
            } else {
                base = Class.prototype;
                protoInitializers = protoInitializers || [];
                initializers = protoInitializers;
            }
            if (kind !== 0 && !isPrivate) {
                var existingNonFields = isStatic ? existingStaticNonFields : existingProtoNonFields;
                var existingKind = existingNonFields.get(name) || 0;
                if (existingKind === true || existingKind === 3 && kind !== 4 || existingKind === 4 && kind !== 3) {
                    throw new Error("Attempted to decorate a public method/accessor that has the same name as a previously decorated public method/accessor. This is not currently supported by the decorators plugin. Property name was: " + name);
                } else if (!existingKind && kind > 2) {
                    existingNonFields.set(name, kind);
                } else {
                    existingNonFields.set(name, true);
                }
            }
            applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, initializers, metadata);
        }
        pushInitializers(ret, protoInitializers);
        pushInitializers(ret, staticInitializers);
        return ret;
    }
    function pushInitializers(ret, initializers) {
        if (initializers) {
            ret.push(function(instance) {
                for(var i = 0; i < initializers.length; i++){
                    initializers[i].call(instance);
                }
                return instance;
            });
        }
    }
    function applyClassDecs(targetClass, classDecs, metadata) {
        if (classDecs.length > 0) {
            var initializers = [];
            var newClass = targetClass;
            var name = targetClass.name;
            for(var i = classDecs.length - 1; i >= 0; i--){
                var decoratorFinishedRef = {
                    v: false
                };
                try {
                    var nextNewClass = classDecs[i](newClass, {
                        kind: "class",
                        name: name,
                        addInitializer: createAddInitializerMethod(initializers, decoratorFinishedRef),
                        metadata
                    });
                } finally{
                    decoratorFinishedRef.v = true;
                }
                if (nextNewClass !== undefined) {
                    assertValidReturnValue(10, nextNewClass);
                    newClass = nextNewClass;
                }
            }
            return [
                defineMetadata(newClass, metadata),
                function() {
                    for(var i = 0; i < initializers.length; i++){
                        initializers[i].call(newClass);
                    }
                }
            ];
        }
    }
    function defineMetadata(Class, metadata) {
        return Object.defineProperty(Class, Symbol.metadata || Symbol.for("Symbol.metadata"), {
            configurable: true,
            enumerable: true,
            value: metadata
        });
    }
    return function applyDecs2203R(targetClass, memberDecs, classDecs, parentClass) {
        if (parentClass !== void 0) {
            var parentMetadata = parentClass[Symbol.metadata || Symbol.for("Symbol.metadata")];
        }
        var metadata = Object.create(parentMetadata === void 0 ? null : parentMetadata);
        var e = applyMemberDecs(targetClass, memberDecs, metadata);
        if (!classDecs.length) defineMetadata(targetClass, metadata);
        return {
            e: e,
            get c () {
                return applyClassDecs(targetClass, classDecs, metadata);
            }
        };
    };
}
function _apply_decs_2203_r(targetClass, memberDecs, classDecs, parentClass) {
    return (_apply_decs_2203_r = applyDecs2203RFactory())(targetClass, memberDecs, classDecs, parentClass);
}
import { consume } from "https://esm.sh/@lit/context";
import { html } from "https://esm.sh/lit";
import { property, queryAssignedElements } from "https://esm.sh/lit/decorators.js";
import { _ } from "/modules/official/stdlib/deps.js";
import { scrollContainerCtx, scrollTimeoutCtx } from "./contexts.js";
export const SyncedMixin = (superClass)=>{
    var _dec, _dec1, _dec2, _init_content, _init_tsp// time start percent
    , _init_tep// time end percent
    , _initProto;
    _dec = property(), _dec1 = property({
        type: Number
    }), _dec2 = property({
        type: Number
    });
    class mixedClass extends superClass {
        static{
            ({ e: [_init_content, _init_tsp, _init_tep, _initProto] } = _apply_decs_2203_r(this, [
                [
                    _dec,
                    1,
                    "content"
                ],
                [
                    _dec1,
                    1,
                    "tsp"
                ],
                [
                    _dec2,
                    1,
                    "tep"
                ]
            ], []));
        }
        #___private_content = (_initProto(this), _init_content(this, ""));
        get content() {
            return this.#___private_content;
        }
        set content(_v) {
            this.#___private_content = _v;
        }
        #___private_tsp = _init_tsp(this, 0);
        get tsp() {
            return this.#___private_tsp;
        }
        set tsp(_v) {
            this.#___private_tsp = _v;
        }
        #___private_tep = _init_tep(this, 1);
        get tep() {
            return this.#___private_tep;
        }
        set tep(_v) {
            this.#___private_tep = _v;
        }
        updateProgress(scaledProgress, depthToActiveAncestor) {}
    }
    return mixedClass;
};
export const AnimatedMixin = (superClass)=>{
    class mixedClass extends superClass {
        csp;
        dtaa;
        updateProgress(scaledProgress, depthToActiveAncestor) {
            super.updateProgress(scaledProgress, depthToActiveAncestor);
            const clampedScaledProgress = _.clamp(scaledProgress, -0.5, 1.5);
            if (this.shouldAnimate(clampedScaledProgress, depthToActiveAncestor)) {
                this.csp = clampedScaledProgress;
                this.dtaa = depthToActiveAncestor;
                this.animateContent();
            }
        }
        shouldAnimate(clampedScaledProgress, depthToActiveAncestor) {
            return this.csp !== clampedScaledProgress || this.dtaa !== depthToActiveAncestor;
        }
        animateContent() {}
    }
    return mixedClass;
};
export const ScrolledMixin = (superClass)=>{
    var _dec, _dec1, _init_scrollTimeout, _init_scrollContainer;
    _dec = consume({
        context: scrollTimeoutCtx,
        subscribe: true
    }), _dec1 = consume({
        context: scrollContainerCtx
    });
    class mixedClass extends superClass {
        static{
            ({ e: [_init_scrollTimeout, _init_scrollContainer] } = _apply_decs_2203_r(this, [
                [
                    _dec,
                    0,
                    "scrollTimeout"
                ],
                [
                    _dec1,
                    0,
                    "scrollContainer"
                ]
            ], []));
        }
        scrollTimeout = _init_scrollTimeout(this, 0);
        scrollContainer = _init_scrollContainer(this);
        dtaa;
        updateProgress(progress, depthToActiveAncestor) {
            super.updateProgress(progress, depthToActiveAncestor);
            const isActive = depthToActiveAncestor === 0;
            const wasActive = this.dtaa === 0;
            const bypassProximityCheck = this.dtaa === undefined;
            this.dtaa = depthToActiveAncestor;
            if (!isActive || wasActive) return;
            if (Date.now() < this.scrollTimeout || !this.scrollContainer) return;
            const lineHeight = parseInt(document.defaultView.getComputedStyle(this).lineHeight);
            const scrollTop = this.offsetTop - this.scrollContainer.offsetTop - lineHeight * 2;
            const verticalLinesToActive = Math.abs(scrollTop - this.scrollContainer.scrollTop) / this.scrollContainer.offsetHeight;
            if (!bypassProximityCheck && !_.inRange(verticalLinesToActive, 0.1, 0.75)) return;
            this.scrollContainer.scrollTo({
                top: scrollTop,
                behavior: document.visibilityState === "visible" ? "smooth" : "auto"
            });
        }
    }
    return mixedClass;
};
export const SyncedContainerMixin = (superClass)=>{
    var _dec, _init_childs, _initProto;
    _dec = queryAssignedElements();
    class mixedClass extends superClass {
        static{
            ({ e: [_init_childs, _initProto] } = _apply_decs_2203_r(this, [
                [
                    _dec,
                    1,
                    "childs"
                ]
            ], []));
        }
        #___private_childs = (_initProto(this), _init_childs(this));
        get childs() {
            return this.#___private_childs;
        }
        set childs(_v) {
            this.#___private_childs = _v;
        }
        computeChildProgress(rp, child) {
            return rp;
        }
        updateProgress(rp, depthToActiveAncestor) {
            super.updateProgress(rp, depthToActiveAncestor);
            const childs = Array.from(this.childs);
            if (childs.length === 0) return;
            childs.forEach((child, i)=>{
                const progress = this.computeChildProgress(rp, i);
                const isActive = _.inRange(rp, child.tsp, child.tep);
                child.updateProgress(progress, depthToActiveAncestor + (isActive ? 0 : 1));
            });
        }
        render() {
            return html`<slot></slot><br />`;
        }
    }
    return mixedClass;
};
