import { consume } from "https://esm.sh/@lit/context";
import { html, LitElement } from "https://esm.sh/lit";
import { property, queryAssignedElements } from "https://esm.sh/lit/decorators.js";

import { clamp } from "/modules/stdlib/deps.ts";

import { scrollContainerCtx, scrollTimeoutCtx } from "./contexts.ts";

type Constructor<T = {}> = new (...args: any[]) => T;

export declare class SyncedMixinI {
	content: string;
	tsp: number;
	tep: number;

	updateProgress(scaledProgress: number, depthToActiveAncestor: number): void;
}

export const SyncedMixin = <T extends Constructor<LitElement>>(superClass: T) => {
	class mixedClass extends superClass {
		@property()
		accessor content = "";
		@property({ type: Number })
		accessor tsp = 0; // time start percent
		@property({ type: Number })
		accessor tep = 1; // time end percent

		updateProgress(scaledProgress: number, depthToActiveAncestor: number) {}
	}

	return mixedClass as Constructor<SyncedMixinI> & T;
};

export const AnimatedMixin = <T extends Constructor<LitElement & SyncedMixinI>>(superClass: T) => {
	class mixedClass extends superClass {
		csp!: number;
		dtaa!: number;
		override updateProgress(scaledProgress: number, depthToActiveAncestor: number) {
			super.updateProgress(scaledProgress, depthToActiveAncestor);
			const clampedScaledProgress = clamp(scaledProgress, -0.5, 1.5);
			if (this.shouldAnimate(clampedScaledProgress, depthToActiveAncestor)) {
				this.csp = clampedScaledProgress;
				this.dtaa = depthToActiveAncestor;
				this.animateContent();
			}
		}
		shouldAnimate(clampedScaledProgress: number, depthToActiveAncestor: number) {
			return this.csp !== clampedScaledProgress || this.dtaa !== depthToActiveAncestor;
		}
		animateContent() {}
	}

	return mixedClass;
};

export const ScrolledMixin = <T extends Constructor<LitElement & SyncedMixinI>>(superClass: T) => {
	class mixedClass extends superClass {
		@consume({ context: scrollTimeoutCtx, subscribe: true })
		scrollTimeout = 0;
		@consume({ context: scrollContainerCtx })
		scrollContainer?: HTMLElement;

		dtaa!: number;

		override updateProgress(progress: number, depthToActiveAncestor: number) {
			super.updateProgress(progress, depthToActiveAncestor);
			const isActive = depthToActiveAncestor === 0;
			const wasActive = this.dtaa === 0;
			const bypassProximityCheck = this.dtaa === undefined;
			this.dtaa = depthToActiveAncestor;

			if (!isActive || wasActive) return;
			if (Date.now() < this.scrollTimeout || !this.scrollContainer) return;

			const lineHeight = parseInt(document.defaultView!.getComputedStyle(this).lineHeight);
			const scrollTop = this.offsetTop - this.scrollContainer.offsetTop - lineHeight * 2;
			const verticalLinesToActive = Math.abs(scrollTop - this.scrollContainer.scrollTop) /
				this.scrollContainer.offsetHeight;

			const isProximal = 0.1 <= verticalLinesToActive && verticalLinesToActive < 0.75;
			if (!bypassProximityCheck && !isProximal) {
				return;
			}

			this.scrollContainer.scrollTo({
				top: scrollTop,
				behavior: document.visibilityState === "visible" ? "smooth" : "auto",
			});
		}
	}

	return mixedClass;
};

export const SyncedContainerMixin = <T extends Constructor<LitElement & SyncedMixinI>>(superClass: T) => {
	class mixedClass extends superClass {
		@queryAssignedElements()
		accessor childs!: NodeListOf<LitElement & SyncedMixinI>;

		computeChildProgress(rp: number, child: number) {
			return rp;
		}

		override updateProgress(rp: number, depthToActiveAncestor: number) {
			super.updateProgress(rp, depthToActiveAncestor);
			const childs = Array.from(this.childs);
			if (childs.length === 0) return;

			childs.forEach((child, i) => {
				const progress = this.computeChildProgress(rp, i);
				const isActive = child.tsp <= rp && rp < child.tep;
				child.updateProgress(progress, depthToActiveAncestor + (isActive ? 0 : 1));
			});
		}

		override render() {
			return html`<slot></slot><br />`;
		}
	}

	return mixedClass;
};
