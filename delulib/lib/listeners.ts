import { _ } from "/modules/Delusoire/stdlib/deps.js";
import { S } from "/modules/Delusoire/stdlib/index.js";

import { PermanentMutationObserver } from "./util.js";
import { REACT_FIBER } from "/modules/Delusoire/stdlib/lib/util.js";

const { URI } = S;
const History = S.Platform.getHistory();

export const getTrackLists = () => Array.from(document.querySelectorAll<HTMLDivElement>(".main-trackList-trackList.main-trackList-indexable"));
export const getTrackListTracks = (trackList: HTMLDivElement) =>
	Array.from(trackList.querySelectorAll<HTMLDivElement>(".main-trackList-trackListRow"));

const PRESENTATION_KEY = Symbol("presentation");

type TrackListElement = HTMLDivElement & {
	[PRESENTATION_KEY]?: HTMLDivElement;
};
type TrackElement = HTMLDivElement & { props?: Record<string, any> };

type TrackListMutationListener = (tracklist: Required<TrackListElement>, tracks: Array<Required<TrackElement>>) => void;
// TODO: use a Subject & handle module lifecycles correctly
export const onTrackListMutationListeners = new Array<TrackListMutationListener>();

const _onTrackListMutation = (trackList: Required<TrackListElement>, record: MutationRecord[], observer: MutationObserver) => {
	const tracks = getTrackListTracks(trackList[PRESENTATION_KEY]) as Array<Required<TrackElement>>;

	const recUp = fiber => {
		const parent = fiber.return;
		if (parent.pendingProps.role === "presentation") return fiber;
		return recUp(parent);
	};

	for (const track of tracks) {
		track.props ??= recUp(track[REACT_FIBER]).pendingProps;
	}

	const fullyRenderedTracks = tracks.filter(track => track.props?.uri);

	onTrackListMutationListeners.map(listener => listener(trackList, fullyRenderedTracks));
};

new PermanentMutationObserver("main", () => {
	const trackLists = getTrackLists() as Array<TrackListElement>;
	for (const trackList of trackLists.filter(trackList => !trackList[PRESENTATION_KEY])) {
		trackList[PRESENTATION_KEY] = trackList.lastElementChild!.firstElementChild!.nextElementSibling! as HTMLDivElement;

		new MutationObserver((record, observer) => _onTrackListMutation(trackList as Required<TrackListElement>, record, observer)).observe(
			trackList[PRESENTATION_KEY],
			{ childList: true },
		);
	}
});
