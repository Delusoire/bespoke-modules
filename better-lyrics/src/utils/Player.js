import {
	BehaviorSubject,
	Observable,
	Subject,
	Subscription,
	animationFrameScheduler,
	asyncScheduler,
	interval,
	takeUntil,
} from "https://esm.sh/rxjs";
import { S } from "/modules/official/stdlib/index.js";
import { getSongPositionMs } from "/modules/Delusoire/delulib/lib/util.js";
import { eventBus } from "../../index.js";
import { findLyrics } from "./LyricsProvider.js";
const PlayerAPI = S.Platform.getPlayerAPI();
const takeIf = predicate => observable =>
	new Observable(subscriber => {
		observable.subscribe({
			next(value) {
				predicate(value) && subscriber.next(value);
			},
			error(err) {
				subscriber.error(err);
			},
			complete() {
				subscriber.complete();
			},
		});
	});
export const Player = new (class {
	stateSubject = new BehaviorSubject(null);
	progressPercentSubject = new Subject();
	s = new Subscription();
	constructor() {
		eventBus.Player.song_changed.subscribe(state => {
			const { item } = state;
			if (item && item.type === "track") {
				state.item.lyrics = findLyrics({
					uri: item.uri,
					title: item.name,
					artist: item.artists[0].name,
					album: item.album.name,
					durationS: item.duration.milliseconds / 1000,
				});
				this.stateSubject.next(state);
			} else if (this.stateSubject.getValue() !== state) {
				this.stateSubject.next(null);
			}
		});
		const quadIntervalObservable = new Observable(subscriber => {
			let syncs = 0;
			const timeoutFn = () => 1000 * ++syncs;
			return asyncScheduler.schedule(function () {
				if (!subscriber.closed) {
					subscriber.next();
					this.schedule(undefined, timeoutFn());
				}
			});
		});
		const pauseObservable = eventBus.Player.status_changed.pipe(takeIf(state => state.isPaused || state.isBuffering));
		const playObservable = eventBus.Player.status_changed.pipe(takeIf(state => !state.isPaused && !state.isBuffering));
		const quadIntervalUntilPausedObservable = quadIntervalObservable.pipe(takeUntil(pauseObservable));
		const animationFrameIntervalObservable = interval(0, animationFrameScheduler);
		const animationFrameIntervalUntilPlayedObservable = animationFrameIntervalObservable.pipe(takeUntil(playObservable));
		this.s.add(
			playObservable.subscribe(() => {
				this.s.add(
					quadIntervalUntilPausedObservable.subscribe(() => {
						!PlayerAPI._events.emitResumeSync() && PlayerAPI._contextPlayer.resume({});
					}),
				);
				this.s.add(
					animationFrameIntervalUntilPlayedObservable.subscribe(() => {
						const item = PlayerAPI.getState().item;
						const progress = getSongPositionMs(item);
						const scaledProgress = progress / item.duration;
						this.progressPercentSubject.next(scaledProgress);
					}),
				);
			}),
		);
	}
	setTimestamp = percent => {
		PlayerAPI.seekTo(Math.round(percent * this.stateSubject.getValue().item.duration.milliseconds));
		this.progressPercentSubject.next(percent);
	};
})();
