function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
import { LitElement, css, html } from "https://esm.sh/lit";
import { customElement, property } from "https://esm.sh/lit/decorators.js";
import { map } from "https://esm.sh/lit/directives/map.js";
import { styleMap } from "https://esm.sh/lit/directives/style-map.js";
import { CLICKABLE_ELEMENT_SELECTOR, isElementInViewPort } from "./util.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
export const mousetrapInst = S.Mousetrap();
export const KEY_LIST = "abcdefghijklmnopqrstuvwxyz".split("");
export let listeningToSneakBinds = false;
class _SneakKey extends LitElement {
    static styles = css`
        :host > span {
            position: fixed;
            padding: 3px 6px;
            background-color: black;
            border-radius: 3px;
            border: solid 2px white;
            color: white;
            text-transform: lowercase;
            line-height: normal;
            font-size: 14px;
            font-weight: 500;
        }
    `;
    key = "None";
    target = document.body;
    render() {
        const { x, y } = this.target.getBoundingClientRect();
        const styles = {
            top: `${y}px`,
            left: `${x}px`
        };
        return html`<span style=${styleMap(styles)}>${this.key}</span>`;
    }
}
_ts_decorate([
    property()
], _SneakKey.prototype, "key", void 0);
_ts_decorate([
    property()
], _SneakKey.prototype, "target", void 0);
_SneakKey = _ts_decorate([
    customElement("sneak-key")
], _SneakKey);
export class _SneakOverlay extends LitElement {
    static styles = css`
        :host {
            z-index: 1e5;
            position: absolute;
            width: 100%;
            height: 100%;
            display: block;
        }
    `;
    props = [];
    constructor(){
        super();
        requestAnimationFrame(()=>{
            let k1 = 0;
            let k2 = 0;
            this.props = Array.from(document.querySelectorAll(CLICKABLE_ELEMENT_SELECTOR))// .filter(isElementVisible),
            .filter(isElementInViewPort).map((target)=>{
                const key = KEY_LIST[k1] + KEY_LIST[k2++];
                if (k2 >= KEY_LIST.length) k1++, k2 = 0;
                return {
                    target,
                    key
                };
            });
            if (k1 + k2 === 0) this.remove();
            else listeningToSneakBinds = true;
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        listeningToSneakBinds = false;
    }
    updateProps(key) {
        if (!listeningToSneakBinds) return;
        this.props = this.props.filter((prop)=>{
            const [k1, ...ks] = prop.key.toLowerCase();
            if (k1 !== key) return false;
            prop.key = ks.join("");
            return true;
        });
        if (this.props.length === 1) this.props[0].target.click();
        if (this.props.length < 2) this.remove();
    }
    render() {
        return html`${map(this.props, (i)=>html`<sneak-key part="key" key=${i.key} .target=${i.target} />`)}`;
    }
}
_ts_decorate([
    property()
], _SneakOverlay.prototype, "props", void 0);
_SneakOverlay = _ts_decorate([
    customElement("sneak-overlay")
], _SneakOverlay);
