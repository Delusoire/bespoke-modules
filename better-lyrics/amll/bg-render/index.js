/**
 * @fileoverview
 * 一个播放歌词的组件
 * @author SteveXMH
 */ export { AbstractBaseRenderer, BaseRenderer } from "./base.js";
export { EplorRenderer } from "./eplor-renderer.js";
export class BackgroundRender {
    renderer;
    element;
    constructor(renderer, element){
        this.renderer = renderer;
        this.element = element;
        element.style.pointerEvents = "none";
        element.style.zIndex = "-1";
        element.style.contain = "strict";
    }
    static new(type) {
        const canvas = document.createElement("canvas");
        return new BackgroundRender(new type(canvas), canvas);
    }
    setRenderScale(scale) {
        this.renderer.setRenderScale(scale);
    }
    setFlowSpeed(speed) {
        this.renderer.setFlowSpeed(speed);
    }
    setStaticMode(enable) {
        this.renderer.setStaticMode(enable);
    }
    setFPS(fps) {
        this.renderer.setFPS(fps);
    }
    pause() {
        this.renderer.pause();
    }
    resume() {
        this.renderer.resume();
    }
    setLowFreqVolume(volume) {
        this.renderer.setLowFreqVolume(volume);
    }
    setHasLyric(hasLyric) {
        this.renderer.setHasLyric(hasLyric);
    }
    setAlbum(albumSource, isVideo) {
        return this.renderer.setAlbum(albumSource, isVideo);
    }
    getElement() {
        return this.element;
    }
    dispose() {
        this.renderer.dispose();
        this.element.remove();
    }
}
