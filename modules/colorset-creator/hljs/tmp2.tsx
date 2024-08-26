const { React } = await import("/modules/stdlib/src/expose/React.ts");

const { CSSCodeBlock } = await import("/modules/palette-manager/hljs/tmp.tsx");
const { ReactDOM } = await import("/modules/stdlib/src/webpack/React.ts");

ReactDOM.render(
	React.createElement(CSSCodeBlock, {
		value: `
/* Copyright (C) 2024 harbassan
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* Copyright (C) 2024 harbassan
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* Basic styles to map the colors to different UI elements */

/* main background */

.ZQftYELq0aOsg6tPbVbV,
.sqKERfoKl4KwrtHqcKOd {
    background-color: var(--spice-base);
}

/* context menus */

.NbcaczStd8vD2rHWwaKv {
    background-color: var(--spice-card);
}

/* general */

a {
    color: var(--spice-text);
}

/* navbar items */

.link-subtle {
    color: var(--spice-tab);
}

.link-subtle:hover,
    .link-subtle:active,
    .link-subtle:active>svg {
        color: var(--spice-tab-active);
    }

/* playbar */

.epWhU7hHGktzlO_dop6z {
    background-color: var(--spice-playbar);
}

.DFtdzavKSbEhwKYkPTa6 .DuvrswZugGajIFNXObAr .epWhU7hHGktzlO_dop6z,
.DFtdzavKSbEhwKYkPTa6 .TywOcKZEqNynWecCiATc:focus .epWhU7hHGktzlO_dop6z,
.DFtdzavKSbEhwKYkPTa6 .TywOcKZEqNynWecCiATc:hover .epWhU7hHGktzlO_dop6z,
.DFtdzavKSbEhwKYkPTa6:focus-within .epWhU7hHGktzlO_dop6z {
    background-color: var(--spice-playbar-active);
}

/* buttons */

.Vz6yjzttS0YlLcwrkoUR.tP0mccyU1WAa7I9PevC1,
.Vz6yjzttS0YlLcwrkoUR.tP0mccyU1WAa7I9PevC1:not([disabled]):focus,
.Vz6yjzttS0YlLcwrkoUR.tP0mccyU1WAa7I9PevC1:not([disabled]):hover,
.Vz6yjzttS0YlLcwrkoUR.tP0mccyU1WAa7I9PevC1:not([disabled]):focus:not(:focus-visible, :hover) {
    color: var(--spice-button);
}

.KAZD28usA1vPz5GVpm63.RK45o6dbvO1mb0wQtSwq,
.KAZD28usA1vPz5GVpm63.RK45o6dbvO1mb0wQtSwq:focus,
.KAZD28usA1vPz5GVpm63.RK45o6dbvO1mb0wQtSwq:hover,
.KAZD28usA1vPz5GVpm63.RK45o6dbvO1mb0wQtSwq:active:focus,
.KAZD28usA1vPz5GVpm63.RK45o6dbvO1mb0wQtSwq:active:hover {
    color: var(--spice-button);
}

.KAZD28usA1vPz5GVpm63.EHxL6K_6WWDlTCZP6x5w:after {
    background-color: var(--spice-button);
}

/* playing gif */

.n5XwsUqagSoVk8oMiw1x,
.jxXIarsEHgz2HoaVCVzA {
    background: var(--spice-button);
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg id='playing-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 24'%3E%3Cdefs%3E%3Cstyle%3E %23playing-icon %7B fill: %2320BC54; %7D @keyframes play %7B 0%25 %7Btransform: scaleY(1);%7D 3.3%25 %7Btransform: scaleY(0.9583);%7D 6.6%25 %7Btransform: scaleY(0.9166);%7D 9.9%25 %7Btransform: scaleY(0.8333);%7D 13.3%25 %7Btransform: scaleY(0.7083);%7D 16.6%25 %7Btransform: scaleY(0.5416);%7D 19.9%25 %7Btransform: scaleY(0.4166);%7D 23.3%25 %7Btransform: scaleY(0.25);%7D 26.6%25 %7Btransform: scaleY(0.1666);%7D 29.9%25 %7Btransform: scaleY(0.125);%7D 33.3%25 %7Btransform: scaleY(0.125);%7D 36.6%25 %7Btransform: scaleY(0.1666);%7D 39.9%25 %7Btransform: scaleY(0.1666);%7D 43.3%25 %7Btransform: scaleY(0.2083);%7D 46.6%25 %7Btransform: scaleY(0.2916);%7D 49.9%25 %7Btransform: scaleY(0.375);%7D 53.3%25 %7Btransform: scaleY(0.5);%7D 56.6%25 %7Btransform: scaleY(0.5833);%7D 59.9%25 %7Btransform: scaleY(0.625);%7D 63.3%25 %7Btransform: scaleY(0.6666);%7D 66.6%25 %7Btransform: scaleY(0.6666);%7D 69.9%25 %7Btransform: scaleY(0.6666);%7D 73.3%25 %7Btransform: scaleY(0.6666);%7D 76.6%25 %7Btransform: scaleY(0.7083);%7D 79.9%25 %7Btransform: scaleY(0.75);%7D 83.3%25 %7Btransform: scaleY(0.8333);%7D 86.6%25 %7Btransform: scaleY(0.875);%7D 89.9%25 %7Btransform: scaleY(0.9166);%7D 93.3%25 %7Btransform: scaleY(0.9583);%7D 96.6%25 %7Btransform: scaleY(1);%7D %7D %23bar1 %7B transform-origin: bottom; animation: play 0.9s -0.51s infinite; %7D %23bar2 %7B transform-origin: bottom; animation: play 0.9s infinite; %7D %23bar3 %7B transform-origin: bottom; animation: play 0.9s -0.15s infinite; %7D %23bar4 %7B transform-origin: bottom; animation: play 0.9s -0.75s infinite; %7D %3C/style%3E%3C/defs%3E%3Ctitle%3Eplaying-icon%3C/title%3E%3Crect id='bar1' class='cls-1' width='4' height='24'/%3E%3Crect id='bar2' class='cls-1' x='6' width='4' height='24'/%3E%3Crect id='bar3' class='cls-1' x='12' width='4' height='24'/%3E%3Crect id='bar4' class='cls-1' x='18' width='4' height='24'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg id='playing-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 24'%3E%3Cdefs%3E%3Cstyle%3E %23playing-icon %7B fill: %2320BC54; %7D @keyframes play %7B 0%25 %7Btransform: scaleY(1);%7D 3.3%25 %7Btransform: scaleY(0.9583);%7D 6.6%25 %7Btransform: scaleY(0.9166);%7D 9.9%25 %7Btransform: scaleY(0.8333);%7D 13.3%25 %7Btransform: scaleY(0.7083);%7D 16.6%25 %7Btransform: scaleY(0.5416);%7D 19.9%25 %7Btransform: scaleY(0.4166);%7D 23.3%25 %7Btransform: scaleY(0.25);%7D 26.6%25 %7Btransform: scaleY(0.1666);%7D 29.9%25 %7Btransform: scaleY(0.125);%7D 33.3%25 %7Btransform: scaleY(0.125);%7D 36.6%25 %7Btransform: scaleY(0.1666);%7D 39.9%25 %7Btransform: scaleY(0.1666);%7D 43.3%25 %7Btransform: scaleY(0.2083);%7D 46.6%25 %7Btransform: scaleY(0.2916);%7D 49.9%25 %7Btransform: scaleY(0.375);%7D 53.3%25 %7Btransform: scaleY(0.5);%7D 56.6%25 %7Btransform: scaleY(0.5833);%7D 59.9%25 %7Btransform: scaleY(0.625);%7D 63.3%25 %7Btransform: scaleY(0.6666);%7D 66.6%25 %7Btransform: scaleY(0.6666);%7D 69.9%25 %7Btransform: scaleY(0.6666);%7D 73.3%25 %7Btransform: scaleY(0.6666);%7D 76.6%25 %7Btransform: scaleY(0.7083);%7D 79.9%25 %7Btransform: scaleY(0.75);%7D 83.3%25 %7Btransform: scaleY(0.8333);%7D 86.6%25 %7Btransform: scaleY(0.875);%7D 89.9%25 %7Btransform: scaleY(0.9166);%7D 93.3%25 %7Btransform: scaleY(0.9583);%7D 96.6%25 %7Btransform: scaleY(1);%7D %7D %23bar1 %7B transform-origin: bottom; animation: play 0.9s -0.51s infinite; %7D %23bar2 %7B transform-origin: bottom; animation: play 0.9s infinite; %7D %23bar3 %7B transform-origin: bottom; animation: play 0.9s -0.15s infinite; %7D %23bar4 %7B transform-origin: bottom; animation: play 0.9s -0.75s infinite; %7D %3C/style%3E%3C/defs%3E%3Ctitle%3Eplaying-icon%3C/title%3E%3Crect id='bar1' class='cls-1' width='4' height='24'/%3E%3Crect id='bar2' class='cls-1' x='6' width='4' height='24'/%3E%3Crect id='bar3' class='cls-1' x='12' width='4' height='24'/%3E%3Crect id='bar4' class='cls-1' x='18' width='4' height='24'/%3E%3C/svg%3E");
    -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
    content-visibility: hidden;
}

/* Color Mapping */

.encore-dark-theme {
	--background-base: var(--spice-main);
	--background-highlight: var(--spice-highlight);
	--background-press: var(--spice-highlight);
	--background-elevated-base: var(--spice-main-elevated);
	--background-elevated-highlight: var(--spice-highlight-elevated);
	--background-elevated-press: var(--spice-highlight-elevated);
	--background-tinted-base: rgba(255, 255, 255, 0.07);
	--background-tinted-highlight: rgba(255, 255, 255, 0.1);
	--background-tinted-press: rgba(255, 255, 255, 0.04);
	--text-base: var(--spice-text);
	--text-subdued: var(--spice-subtext);
	--text-bright-accent: var(--spice-button);
	--text-positive: var(--spice-button-active);
	--text-announcement: var(--spice-notification);
	--essential-base: var(--spice-button);
	--essential-bright-accent: var(--spice-button-active);
	--essential-positive: var(--spice-button-active);
	--essential-announcement: var(--spice-notification);
	--decorative-subdued: var(--spice-card);
}

.encore-dark-theme .encore-bright-accent-set {
	--background-base: var(--spice-button);
	--background-highlight: var(--spice-button-active);
	--background-press: var(--spice-button-active);
	--text-base: var(--spice-main);
}

/* Modal Styles */

.uUYNnjSt8m3EqVjsnHgh {
	overflow: auto !important;
}

.palette-modal-container {
	--input-bg: #202020;
	--input-bg2: #121212;
	--secondary-bg: #202020;
	--border-radius: 4px;
	--gap-primary: 8px;
	--gap-secondary: 12px;

	display: flex;
	gap: var(--gap-primary);
}

.splitter {
	background: var(--input-bg);
	width: 2px;
}

.palette-list-container {
	width: 12rem;
	background-color: #101010;
	padding: var(--gap-primary);
	border-radius: var(--border-radius);
}

.palette-list-container >ul {
		display: flex;
		flex-direction: column;
	}

.palette-list-container >ul >li {
			margin-top: 4px;
		}

.palette-list-container .palette-list {
		overflow-y: auto;
	}

.palette-list-container .QZhV0hWVKlExlKr266jo {
		width: 100%;
	}

.palette-fields-container {
	flex-grow: 1;
	height: 45vh;
	gap: var(--gap-primary);
	display: flex;
	flex-direction: column;
	font-size: 14px;
	background-color: #121212;
	padding: 8px;
	border-radius: var(--border-radius);
}

.palette-fields-container .palette-fields {
		background-color: var(--secondary-bg);
		border-radius: var(--border-radius);
		padding: var(--gap-primary);
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		height: calc(100% - 40px);
		row-gap: 4px;
		-moz-column-gap: var(--gap-secondary);
		     column-gap: var(--gap-secondary);
	}

.palette-fields-container .palette-fields .input-row {
			display: flex;
			align-items: center;
			gap: var(--gap-primary);
		}

.palette-fields-container .palette-fields .text-input {
			background-color: var(--input-bg2);
			padding: 8px;
			border: none;
			border-radius: var(--border-radius);
			height: 30px;
			width: 80px;
		}

.palette-fields-container .palette-fields .color-input {
			border: none;
			height: 30px;
			width: 30px;
			background-color: var(--input-bg2);
			border-radius: 6px;
			padding: 6px;
			margin-left: auto;
		}

.palette-fields-container .palette-fields .color-input::-webkit-color-swatch-wrapper {
				padding: 0;
			}

.palette-fields-container .palette-fields .color-input::-webkit-color-swatch {
				border: none;
				border-radius: 50%;
			}

.palette-fields-container .palette-info {
		display: flex;
		gap: var(--gap-primary);
		align-items: center;
	}

.palette-fields-container .palette-info >button {
			background-color: white;
			border: none;
			height: 32px;
			border-radius: var(--border-radius);
			padding: 0px 12px;
			color: black;
			font-size: 14px;
			cursor: pointer;
		}

.palette-fields-container .palette-info .palette-name {
			background-color: var(--input-bg);
			padding: 8px;
			border: none;
			border-radius: var(--border-radius);
			height: 32px;
			flex-grow: 1;
			font-size: 1rem;
			color: white;
		}

`,
	}),
	document.getElementById("app"),
);
