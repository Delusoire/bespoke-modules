import type { Instance, Props } from "tippy.js";

import { _, fp } from "/modules/Delusoire/std/deps.js";
import { getTracksFromUri } from "../sort-plus/fetch.js";
import { Dropdown } from "./dropdown.js";
import { getCollectionPlaylistButton, getNowPlayingBar, getPlaylistButton, getTrackListTrackUri, getTrackListTracks, getTrackLists } from "./util.js";

import { S } from "/modules/Delusoire/std/index.js";

const { URI, Tippy, ReactDOM } = S;

const UNSET_CSS = "invalid";
const colorByRating = [UNSET_CSS, "#ED5564", "#FFCE54", "A0D568", "#4FC1E8", "#AC92EB"];

const colorizePlaylistButton = (btn: HTMLButtonElement, rating: number) => {
	if (btn.style.fill === colorByRating[rating]) return;

	// Do we need this anymore?
	btn.style.opacity = rating > 0 ? "1" : UNSET_CSS;
	const svg = btn.querySelector<SVGElement>("svg");
	if (!svg) return;
	svg.style.fill = colorByRating[rating];
};

let lastNPTippyInstance: Instance<Props>;
const wrapDropdownInsidePlaylistButton = (pb: HTMLButtonElement, uri: string, forced = false) => {
	if (pb.hasAttribute("dropdown-enabled")) {
		if (!forced) return;
	} else pb.setAttribute("dropdown-enabled", "");

	const div = document.createElement("div");

	pb.appendChild(div);
	// TODO: migrate to use root
	ReactDOM.render(<Dropdown uri={uri} />, div);
	const tippyInstance = Tippy(pb, {
		content: div,
		interactive: true,
		animateFill: false,
		//offset: [0, 7],
		placement: "left",
		animation: "fade",
		//trigger: "mouseenter focus",
		zIndex: 1e4,
		delay: [200, 0],
		render(instance: any) {
			const popper = document.createElement("div");
			const box = document.createElement("div");

			popper.id = "context-menu";
			popper.appendChild(box);

			box.className = "main-contextMenu-tippy";
			box.appendChild(instance.props.content);

			return { popper, onUpdate: () => undefined };
		},
		onShow(instance: any) {
			instance.popper.firstChild.classList.add("main-contextMenu-tippyEnter");

			const children = (instance.reference.parentElement as HTMLDivElement).children;
			const element = children.item(children.length - 1) as HTMLButtonElement;
			element.style.marginRight = "0px";
		},
		onMount(instance: any) {
			requestAnimationFrame(() => {
				instance.popper.firstChild.classList.remove("main-contextMenu-tippyEnter");
				instance.popper.firstChild.classList.add("main-contextMenu-tippyEnterActive");
			});
		},
		onHide(instance: any) {
			requestAnimationFrame(() => {
				instance.popper.firstChild.classList.remove("main-contextMenu-tippyEnterActive");

				const children = (instance.reference.parentElement as HTMLDivElement).children;
				const element = children.item(children.length - 2) as HTMLButtonElement;
				element.style.marginRight = "unset";

				instance.unmount();
			});
		},
	});

	if (forced) {
		lastNPTippyInstance?.destroy();
		lastNPTippyInstance = tippyInstance;
	}
};

export const updateNowPlayingControls = (newTrack: string, updateDropdown = true) => {
	const npb = getNowPlayingBar();
	const pb = getPlaylistButton(npb);
	colorizePlaylistButton(pb, globalThis.tracksRatings[newTrack]);
	if (updateDropdown) wrapDropdownInsidePlaylistButton(pb, newTrack, true);
};

export const updateTrackControls = (track: HTMLElement, uri: string, updateDropdown = true) => {
	if (!URI.is.Track(uri)) return;
	const r = globalThis.tracksRatings[uri];
	const pb = getPlaylistButton(track);

	colorizePlaylistButton(pb, r);
	updateDropdown && wrapDropdownInsidePlaylistButton(pb, uri);
};

export const updateTrackListControls = (updateDropdown = true) =>
	getTrackLists()
		.map(getTrackListTracks)
		.map(
			fp.map(track => {
				const uri = getTrackListTrackUri(track);
				updateTrackControls(track, uri, updateDropdown);
			}),
		);

export const updateCollectionControls = async (uri: string) => {
	const tracks = await getTracksFromUri(uri);
	const ratings = _.compact(tracks.map(track => globalThis.tracksRatings[track.uri]));
	const rating = Math.round(ratings.reduce((psum, r) => psum + r, 0) / ratings.length);

	const pb = getCollectionPlaylistButton();
	pb && colorizePlaylistButton(pb, rating);
};
