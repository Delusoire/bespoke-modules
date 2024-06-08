/**
 * @fileoverview
 * 一个播放歌词的组件
 * @author SteveXMH
 */ export { AbstractBaseRenderer, BaseRenderer } from "./base.js";
export { PixiRenderer } from "./pixi-renderer.js";
export { EplorRenderer } from "./eplor-renderer.js";
export class BackgroundRender {
    element;
    renderer;
    constructor(renderer, canvas){
        this.renderer = renderer;
        this.element = canvas;
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "-1";
        canvas.style.contain = "strict";
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
