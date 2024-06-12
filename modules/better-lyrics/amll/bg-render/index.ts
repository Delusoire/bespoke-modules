/**
 * @fileoverview
 * 一个播放歌词的组件
 * @author SteveXMH
 */

export { AbstractBaseRenderer, BaseRenderer } from "./base.ts";
import { AbstractBaseRenderer, BaseRenderer } from "./base.ts";
export { EplorRenderer } from "./eplor-renderer.ts";

export class BackgroundRender<Renderer extends BaseRenderer> implements AbstractBaseRenderer {
	constructor(private renderer: Renderer, private element: HTMLCanvasElement) {
		element.style.pointerEvents = "none";
		element.style.zIndex = "-1";
		element.style.contain = "strict";
	}

	static new<Renderer extends BaseRenderer>(type: {
		new (canvas: HTMLCanvasElement): Renderer;
	}): BackgroundRender<Renderer> {
		const canvas = document.createElement("canvas");
		return new BackgroundRender(new type(canvas), canvas);
	}

	setRenderScale(scale: number): void {
		this.renderer.setRenderScale(scale);
	}

	setFlowSpeed(speed: number): void {
		this.renderer.setFlowSpeed(speed);
	}
	setStaticMode(enable: boolean): void {
		this.renderer.setStaticMode(enable);
	}
	setFPS(fps: number): void {
		this.renderer.setFPS(fps);
	}
	pause(): void {
		this.renderer.pause();
	}
	resume(): void {
		this.renderer.resume();
	}
	setLowFreqVolume(volume: number): void {
		this.renderer.setLowFreqVolume(volume);
	}
	setHasLyric(hasLyric: boolean): void {
		this.renderer.setHasLyric(hasLyric);
	}
	setAlbum(
		albumSource: string | HTMLImageElement | HTMLVideoElement,
		isVideo?: boolean,
	): Promise<void> {
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
