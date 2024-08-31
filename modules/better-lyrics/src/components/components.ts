import { provide } from "https://esm.sh/@lit/context";
import { Task } from "https://esm.sh/@lit/task";
import { css, html, LitElement } from "https://esm.sh/lit";
import { customElement, property, query, state } from "https://esm.sh/lit/decorators.js";
import { map } from "https://esm.sh/lit/directives/map.js";
import { when } from "https://esm.sh/lit/directives/when.js";
// import { PropertyValueMap } from "https://esm.sh/@lit/reactive-element/development/reactive-element.js";
// import { hermite } from "https://esm.sh/@thi.ng/ramp"

import { runningReduce, zip } from "/hooks/std/collections.ts";
import { remapScalar, vectorLerp } from "/modules/Delusoire.delulib/lib/math.ts";
import { MonotoneNormalSpline } from "../splines/monotoneNormalSpline.ts";
import { type Lyrics, LyricsType } from "../utils/LyricsProvider.ts";
import { Player } from "../utils/Player.ts";
import { loadedLyricsTypeCtx, scrollContainerCtx, scrollTimeoutCtx } from "./contexts.ts";
import { AnimatedMixin, ScrolledMixin, SyncedContainerMixin, SyncedMixin } from "./mixins.ts";

declare global {
	interface HTMLElementTagNameMap {
		[LyricsWrapperName]: LyricsWrapper;
		[LyricsContainerName]: LyricsContainer;
		[TimelineProviderName]: TimelineProvider;
		[DetailTimelineProviderName]: DetailTimelineProvider;
		[AnimatedTextName]: AnimatedText;
	}
}

const opacityInterpolator = new MonotoneNormalSpline([
	[0, 0],
	[0.1, 0.1],
	[0.2, 0.3],
	[0.5, 0.55],
	[0.7, 0.8],
	[1, 1],
	[1.2, 0.8],
	[1.5, 0.7],
]);
const glowRadiusInterpolator = new MonotoneNormalSpline([
	[0, 100],
	[0.2, 7],
	[0.4, 5],
	[0.6, 3],
	[0.7, 2],
	[0.9, 1],
	[1, 3],
	[1.1, 7],
	[1.25, 100],
]);
const glowAlphaInterpolator = new MonotoneNormalSpline([
	[0, 0],
	[0.1, 0.2],
	[0.2, 0.35],
	[0.5, 0.65],
	[0.7, 0.9],
	[1, 1],
	[1.2, 0.6],
	[1.5, 0],
]);
const scaleInterpolator = new MonotoneNormalSpline([
	[-0.5, 1],
	[-0.2, 0.99],
	[-0.1, 0.98],
	[0, 0.94],
	[0.1, 0.99],
	[0.2, 1],
	[0.5, 1.02],
	[0.7, 1.06],
	[0.9, 1.04],
	[1, 1.02],
	[1.2, 1.01],
	[1.5, 1],
]);

const AnimatedTextName = "animated-text";

@customElement(AnimatedTextName)
export class AnimatedText extends AnimatedMixin(SyncedMixin(LitElement)) {
	@property({ type: Boolean })
	accessor split!: boolean;

	static override styles = css`
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

	override animateContent() {
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
		Player.setTimestamp(this.tsp);
	}

	override render() {
		return html`<span role="button" @click=${this.onClick}>${this.content}</span>`;
	}
}

interface Spline<A> {
	at(t: number): A;
}

const DetailTimelineProviderName = "detail-timeline-provider";

@customElement(DetailTimelineProviderName)
export class DetailTimelineProvider extends SyncedContainerMixin(SyncedMixin(LitElement)) {
	static override styles = css`
        :host {
            display: flex;
            flex-wrap: wrap;
        }
    `;

	intermediatePositions?: number[];
	lastPosition?: number;

	override computeChildProgress(rp: number, child: number) {
		if (!this.intermediatePositions) {
			const childs = Array.from(this.childs);
			const partialWidths = childs.reduce(
				(
					partialWidths,
					child,
				) => (partialWidths.push(partialWidths.at(-1)! + child.offsetWidth), partialWidths),
				[0],
			);
			this.lastPosition = partialWidths.at(-1)!;
			this.intermediatePositions = partialWidths.map((pw) => pw / this.lastPosition!);
		}

		return remapScalar(this.intermediatePositions![child], this.intermediatePositions![child + 1], rp);
	}
}

const TimelineProviderName = "timeline-provider";

@customElement(TimelineProviderName)
export class TimelineProvider extends ScrolledMixin(SyncedContainerMixin(SyncedMixin(LitElement))) {
	static override styles = css`
        :host {
            display: flex;
            flex-wrap: wrap;
        }
    `;

	intermediatePositions?: number[];
	lastPosition?: number;
	timelineSpline?: Spline<number>;

	computeIntermediatePosition(rsp: number) {
		if (!this.timelineSpline) {
			const childs = Array.from(this.childs);
			const partialWidths = runningReduce(
				childs,
				(partialWidth, child) => (partialWidth + child.offsetWidth),
				0,
			);
			partialWidths.unshift(0);

			this.lastPosition = partialWidths.at(-1);
			this.intermediatePositions = partialWidths.map((pw) => pw / this.lastPosition!);

			const tps = childs.map((child) => child.tsp);
			tps.push(childs.at(-1)!.tep);

			const pairs = zip(tps, this.intermediatePositions);
			const first = vectorLerp(pairs[0], pairs[1], -1);
			const last = vectorLerp(pairs.at(-2)!, pairs.at(-1)!, 2);
			this.timelineSpline = new MonotoneNormalSpline([first, ...pairs, last]);
		}

		return this.timelineSpline.at(rsp);
	}

	override computeChildProgress(rp: number, child: number) {
		const sip = this.computeIntermediatePosition(rp);
		return remapScalar(this.intermediatePositions![child], this.intermediatePositions![child + 1], sip);
	}
}

const LyricsContainerName = "lyrics-container";

@customElement(LyricsContainerName)
export class LyricsContainer extends SyncedContainerMixin(SyncedMixin(LitElement)) {
	override render() {
		return html`<slot></slot>`;
	}
}

const LyricsWrapperName = "lyrics-wrapper";

@customElement(LyricsWrapperName)
export class LyricsWrapper extends LitElement {
	static readonly SCROLL_TIMEOUT_MS = 500;

	constructor(query: string) {
		super();
		this.scrollContainer = document.querySelector<HTMLElement>(query) ?? undefined;
	}

	static override styles = css`
        :host > animated-content-container {
            display: unset;
        }
    `;

	@property({ attribute: false })
	accessor state: any | null = null;

	@provide({ context: loadedLyricsTypeCtx })
	@state()
	accessor loadedLyricsType: LyricsType | undefined;

	updateState = (state: any | null) => {
		this.state = state;
		this.loadedLyricsType = undefined;
	};

	private lyricsTask = new Task(this, {
		task: async ([state]) => {
			const availableLyrics = (await state?.item.lyrics) as Lyrics;
			const lyrics = Object.values(availableLyrics!)[0];
			this.loadedLyricsType = lyrics?.__type;
			return lyrics;
		},
		args: () => [this.state],
	});

	@query(LyricsContainerName)
	accessor container: LyricsContainer | undefined;
	public updateProgress(progress: number) {
		if (this.loadedLyricsType === undefined || this.loadedLyricsType === LyricsType.NOT_SYNCED) return;
		this.container?.updateProgress(progress, 0);
	}

	@provide({ context: scrollTimeoutCtx })
	accessor scrollTimeout = 0;

	@provide({ context: scrollContainerCtx })
	accessor scrollContainer: HTMLElement | undefined;

	private onExternalScroll(e: Event) {
		this.scrollTimeout = Date.now() + LyricsWrapper.SCROLL_TIMEOUT_MS;
	}

	override connectedCallback() {
		super.connectedCallback();
		this.scrollContainer?.addEventListener("scroll", this.onExternalScroll);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.scrollContainer?.removeEventListener("scroll", this.onExternalScroll);
	}

	override render() {
		if (!this.state) {
			return html`<div class="info">No Song Loaded</div>`;
		}

		return this.lyricsTask.render({
			pending: () => {
				return html`<div class="loading">Fetching Lyrics...</div>`;
			},
			complete: (lyrics) => {
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
                        ${
					when(
						isWordSync,
						() =>
							html`${
								map(
									lyrics.content,
									(l) =>
										html`<timeline-provider tsp=${l.tsp} tep=${l.tep}
                                            >${
											map(
												l.content,
												(w) =>
													html`<detail-timeline-provider tsp=${w.tsp} tep=${w.tep}
                                                        >${
														map(
															w.content.split(""),
															(c) =>
																html`<animated-text
                                                                    tsp=${w.tsp}
                                                                    content=${c === " " ? " " : c}
                                                                ></animated-text>`,
														)
													}</detail-timeline-provider
                                                    >`,
											)
										}</timeline-provider
                                        >`,
								)
							}`,
						() =>
							html`${
								map(
									lyrics.content,
									(l) =>
										html`<timeline-provider tsp=${l.tsp} tep=${l.tep}
                                            >${
											map(
												l.content,
												(wl) =>
													html`<animated-text
                                                        tsp=${wl.tsp}
                                                        tep=${wl.tep}
                                                        content=${wl.content}
                                                    ></animated-text>`,
											)
										}</timeline-provider
                                        >`,
								)
							}`,
					)
				}</lyrics-container
                    >,
                `;
			},
			error: (e) => {
				console.error(e);
				return html`<div class="error">Error</div>`;
			},
		});
	}
}
