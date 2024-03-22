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
function _identity(x) {
    return x;
}
var _dec, _initClass, _AnimatedMixin, _dec1, _init_split, _dec2, _initClass1, _SyncedContainerMixin, _dec3, _initClass2, _ScrolledMixin, _dec4, _initClass3, _SyncedContainerMixin1, _dec5, _initClass4, _LitElement, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _init_song, _init_loadedLyricsType, _init_container, _init_scrollTimeout, _init_scrollContainer;
import { provide } from "https://esm.sh/@lit/context";
import { Task } from "https://esm.sh/@lit/task";
import { LitElement, css, html } from "https://esm.sh/lit";
import { customElement, property, query, state } from "https://esm.sh/lit/decorators.js";
import { map } from "https://esm.sh/lit/directives/map.js";
import { when } from "https://esm.sh/lit/directives/when.js";
// import { PropertyValueMap } from "https://esm.sh/v133/@lit/reactive-element/development/reactive-element.js";
// import { hermite } from "https://esm.sh/@thi.ng/ramp"
import { _ } from "/modules/Delusoire/stdlib/deps.js";
import { remapScalar, vectorLerp } from "/modules/Delusoire/delulib/lib/math.js";
import { MonotoneNormalSpline } from "../splines/monotoneNormalSpline.js";
import { LyricsType } from "../utils/LyricsProvider.js";
import { PlayerW } from "../utils/PlayerW.js";
import { loadedLyricsTypeCtx, scrollTimeoutCtx, scrollContainerCtx } from "./contexts.js";
import { AnimatedMixin, ScrolledMixin, SyncedContainerMixin, SyncedMixin } from "./mixins.js";
const opacityInterpolator = new MonotoneNormalSpline([
    [
        0,
        0
    ],
    [
        0.1,
        0.1
    ],
    [
        0.2,
        0.3
    ],
    [
        0.5,
        0.55
    ],
    [
        0.7,
        0.8
    ],
    [
        1,
        1
    ],
    [
        1.2,
        0.8
    ],
    [
        1.5,
        0.7
    ]
]);
const glowRadiusInterpolator = new MonotoneNormalSpline([
    [
        0,
        100
    ],
    [
        0.2,
        7
    ],
    [
        0.4,
        5
    ],
    [
        0.6,
        3
    ],
    [
        0.7,
        2
    ],
    [
        0.9,
        1
    ],
    [
        1,
        3
    ],
    [
        1.1,
        7
    ],
    [
        1.25,
        100
    ]
]);
const glowAlphaInterpolator = new MonotoneNormalSpline([
    [
        0,
        0
    ],
    [
        0.1,
        0.2
    ],
    [
        0.2,
        0.35
    ],
    [
        0.5,
        0.65
    ],
    [
        0.7,
        0.9
    ],
    [
        1,
        1
    ],
    [
        1.2,
        0.6
    ],
    [
        1.5,
        0
    ]
]);
const scaleInterpolator = new MonotoneNormalSpline([
    [
        -0.5,
        1
    ],
    [
        -0.2,
        0.99
    ],
    [
        -0.1,
        0.98
    ],
    [
        0,
        0.94
    ],
    [
        0.1,
        0.99
    ],
    [
        0.2,
        1
    ],
    [
        0.5,
        1.02
    ],
    [
        0.7,
        1.06
    ],
    [
        0.9,
        1.04
    ],
    [
        1,
        1.02
    ],
    [
        1.2,
        1.01
    ],
    [
        1.5,
        1
    ]
]);
let _AnimatedText;
_dec = customElement(_AnimatedText.NAME), _dec1 = property();
new class extends _identity {
    constructor(){
        super(_AnimatedText), _initClass();
    }
    static{
        class AnimatedText extends (_AnimatedMixin = AnimatedMixin(SyncedMixin(LitElement))) {
            static{
                ({ e: [_init_split], c: [_AnimatedText, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        0,
                        "split"
                    ]
                ], [
                    _dec
                ], _AnimatedMixin));
            }
            static NAME = "animated-text";
            split = _init_split(this);
            static styles = css`
        :host {
            cursor: pointer;
            background-color: black;
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
            text-shadow: 0 0 var(--glow-radius, 0) rgba(255, 255, 255, var(--glow-alpha, 0));
            transform: translateY(var(--y-offset, 0));
            background-image: linear-gradient(
                var(--gradient-angle),
                rgba(255, 255, 255, var(--gradient-alpha)) var(--gradient-start),
                rgba(255, 255, 255, 0) var(--gradient-end)
            );
        }
    `;
            animateContent() {
                const nextGradientAlpha = opacityInterpolator.at(this.csp).toFixed(5);
                const nextGlowRadius = `${glowRadiusInterpolator.at(this.csp)}px`;
                const nextGlowAlpha = glowAlphaInterpolator.at(this.csp).toFixed(5);
                const nextYOffset = `-${this.offsetHeight * 0.1 * this.csp}px`;
                const nextGradientStart = `${this.csp * 95}%`;
                const nextGradientEnd = `${this.csp * 105}%`;
                const nextScale = scaleInterpolator.at(this.csp).toFixed(5);
                this.style.setProperty("--gradient-alpha", nextGradientAlpha);
                this.style.setProperty("--glow-radius", nextGlowRadius);
                this.style.setProperty("--glow-alpha", nextGlowAlpha);
                this.style.setProperty("--gradient-start", nextGradientStart);
                this.style.setProperty("--gradient-end", nextGradientEnd);
                this.style.setProperty("--y-offset", nextYOffset);
                this.style.scale = nextScale;
            }
            onClick() {
                PlayerW.setTimestamp(this.tsp);
            }
            render() {
                return html`<span role="button" @click=${this.onClick}>${this.content}</span>`;
            }
        }
    }
}();
let _DetailTimelineProvider;
_dec2 = customElement(_DetailTimelineProvider.NAME);
new class extends _identity {
    constructor(){
        super(_DetailTimelineProvider), _initClass1();
    }
    static{
        class DetailTimelineProvider extends (_SyncedContainerMixin = SyncedContainerMixin(SyncedMixin(LitElement))) {
            static{
                ({ c: [_DetailTimelineProvider, _initClass1] } = _apply_decs_2203_r(this, [], [
                    _dec2
                ], _SyncedContainerMixin));
            }
            static NAME = "detail-timeline-provider";
            static styles = css`
        :host {
            display: flex;
            flex-wrap: wrap;
        }
    `;
            intermediatePositions;
            lastPosition;
            computeChildProgress(rp, child) {
                if (!this.intermediatePositions) {
                    const childs = Array.from(this.childs);
                    const partialWidths = childs.reduce((partialWidths, child)=>(partialWidths.push(partialWidths.at(-1) + child.offsetWidth), partialWidths), [
                        0
                    ]);
                    this.lastPosition = partialWidths.at(-1);
                    this.intermediatePositions = partialWidths.map((pw)=>pw / this.lastPosition);
                }
                return remapScalar(this.intermediatePositions[child], this.intermediatePositions[child + 1], rp);
            }
        }
    }
}();
let _TimelineProvider;
_dec3 = customElement(_TimelineProvider.NAME);
new class extends _identity {
    constructor(){
        super(_TimelineProvider), _initClass2();
    }
    static{
        class TimelineProvider extends (_ScrolledMixin = ScrolledMixin(SyncedContainerMixin(SyncedMixin(LitElement)))) {
            static{
                ({ c: [_TimelineProvider, _initClass2] } = _apply_decs_2203_r(this, [], [
                    _dec3
                ], _ScrolledMixin));
            }
            static NAME = "timeline-provider";
            static styles = css`
        :host {
            display: flex;
            flex-wrap: wrap;
        }
    `;
            intermediatePositions;
            lastPosition;
            timelineSpline;
            computeIntermediatePosition(rsp) {
                if (!this.timelineSpline) {
                    const childs = Array.from(this.childs);
                    const partialWidths = childs.reduce((partialWidths, child)=>(partialWidths.push(partialWidths.at(-1) + child.offsetWidth), partialWidths), [
                        0
                    ]);
                    this.lastPosition = partialWidths.at(-1);
                    this.intermediatePositions = partialWidths.map((pw)=>pw / this.lastPosition);
                    const pairs = _.zip(childs.map((child)=>child.tsp).concat(childs.at(-1).tep), this.intermediatePositions);
                    const first = vectorLerp(pairs[0], pairs[1], -1);
                    const last = vectorLerp(pairs.at(-2), pairs.at(-1), 2);
                    this.timelineSpline = new MonotoneNormalSpline([
                        first,
                        ...pairs,
                        last
                    ]);
                }
                return this.timelineSpline.at(rsp);
            }
            computeChildProgress(rp, child) {
                const sip = this.computeIntermediatePosition(rp);
                return remapScalar(this.intermediatePositions[child], this.intermediatePositions[child + 1], sip);
            }
        }
    }
}();
let _LyricsContainer;
_dec4 = customElement(_LyricsContainer.NAME);
new class extends _identity {
    constructor(){
        super(_LyricsContainer), _initClass3();
    }
    static{
        class LyricsContainer extends (_SyncedContainerMixin1 = SyncedContainerMixin(SyncedMixin(LitElement))) {
            static{
                ({ c: [_LyricsContainer, _initClass3] } = _apply_decs_2203_r(this, [], [
                    _dec4
                ], _SyncedContainerMixin1));
            }
            static NAME = "lyrics-container";
            render() {
                return html`<slot></slot>`;
            }
        }
    }
}();
let _LyricsWrapper;
_dec5 = customElement(_LyricsWrapper.NAME), _dec6 = property({
    attribute: false
}), _dec7 = provide({
    context: loadedLyricsTypeCtx
}), _dec8 = state(), _dec9 = query(_LyricsContainer.NAME), _dec10 = provide({
    context: scrollTimeoutCtx
}), _dec11 = provide({
    context: scrollContainerCtx
});
new class extends _identity {
    constructor(){
        super(_LyricsWrapper), _initClass4();
    }
    static{
        class LyricsWrapper extends (_LitElement = LitElement) {
            static{
                ({ e: [_init_song, _init_loadedLyricsType, _init_container, _init_scrollTimeout, _init_scrollContainer], c: [_LyricsWrapper, _initClass4] } = _apply_decs_2203_r(this, [
                    [
                        _dec6,
                        0,
                        "song"
                    ],
                    [
                        [
                            _dec7,
                            _dec8
                        ],
                        0,
                        "loadedLyricsType"
                    ],
                    [
                        _dec9,
                        0,
                        "container"
                    ],
                    [
                        _dec10,
                        0,
                        "scrollTimeout"
                    ],
                    [
                        _dec11,
                        0,
                        "scrollContainer"
                    ]
                ], [
                    _dec5
                ], _LitElement));
            }
            static NAME = "lyrics-wrapper";
            static SCROLL_TIMEOUT_MS = 500;
            constructor(query){
                super();
                this.scrollContainer = document.querySelector(query) ?? undefined;
            }
            static styles = css`
        :host > animated-content-container {
            display: unset;
        }
    `;
            song = _init_song(this, null);
            loadedLyricsType = _init_loadedLyricsType(this);
            updateSong = (song)=>{
                this.song = song;
                this.loadedLyricsType = undefined;
            };
            lyricsTask = new Task(this, {
                task: async ([song])=>{
                    const availableLyrics = await song?.lyrics;
                    const lyrics = Object.values(availableLyrics)[0];
                    this.loadedLyricsType = lyrics?.__type;
                    return lyrics;
                },
                args: ()=>[
                        this.song
                    ]
            });
            container = _init_container(this);
            updateProgress(progress) {
                if (this.loadedLyricsType === undefined || this.loadedLyricsType === LyricsType.NOT_SYNCED) return;
                this.container?.updateProgress(progress, 0);
            }
            scrollTimeout = _init_scrollTimeout(this, 0);
            scrollContainer = _init_scrollContainer(this);
            onExternalScroll(e) {
                this.scrollTimeout = Date.now() + LyricsWrapper.SCROLL_TIMEOUT_MS;
            }
            connectedCallback() {
                super.connectedCallback();
                this.scrollContainer?.addEventListener("scroll", this.onExternalScroll);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.scrollContainer?.removeEventListener("scroll", this.onExternalScroll);
            }
            render() {
                if (!this.song) {
                    return html`<div class="info">No Song Loaded</div>`;
                }
                return this.lyricsTask.render({
                    pending: ()=>{
                        return html`<div class="loading">Fetching Lyrics...</div>`;
                    },
                    complete: (lyrics)=>{
                        if (!lyrics || lyrics.__type === LyricsType.NOT_SYNCED) {
                            return html`<div class="error">No Lyrics Found</div>`;
                        }
                        const isWordSync = this.loadedLyricsType === LyricsType.WORD_SYNCED;
                        return html`
                    <style>
                        * {
                            --gradient-angle: ${this.loadedLyricsType === LyricsType.WORD_SYNCED ? 90 : 180}deg;
                        }
                    </style>
                    <lyrics-container>
                        ${when(isWordSync, ()=>html`${map(lyrics.content, (l)=>html`<timeline-provider tsp=${l.tsp} tep=${l.tep}
                                            >${map(l.content, (w)=>html`<detail-timeline-provider tsp=${w.tsp} tep=${w.tep}
                                                        >${map(w.content.split(""), (c)=>html`<animated-text
                                                                    tsp=${w.tsp}
                                                                    content=${c === " " ? " " : c}
                                                                ></animated-text>`)}</detail-timeline-provider
                                                    >`)}</timeline-provider
                                        >`)}`, ()=>html`${map(lyrics.content, (l)=>html`<timeline-provider tsp=${l.tsp} tep=${l.tep}
                                            >${map(l.content, (wl)=>html`<animated-text
                                                        tsp=${wl.tsp}
                                                        tep=${wl.tep}
                                                        content=${wl.content}
                                                    ></animated-text>`)}</timeline-provider
                                        >`)}`)}</lyrics-container
                    >,
                `;
                    },
                    error: (e)=>{
                        console.error(e);
                        return html`<div class="error">Error</div>`;
                    }
                });
            }
        }
    }
}();
export { _AnimatedText as AnimatedText, _DetailTimelineProvider as DetailTimelineProvider, _TimelineProvider as TimelineProvider, _LyricsContainer as LyricsContainer, _LyricsWrapper as LyricsWrapper };
