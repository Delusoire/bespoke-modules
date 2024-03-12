function _ts_decorate(decorators, target, key, desc) {
	var c = arguments.length,
		r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
		d;
	if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	else for (var i = decorators.length - 1; i >= 0; i--) if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	return c > 3 && r && Object.defineProperty(target, key, r), r;
}
import { LitElement, css, html } from "https://esm.sh/lit";
import { customElement, property, state } from "https://esm.sh/lit/decorators.js";
import { join } from "https://esm.sh/lit/directives/join.js";
import { map } from "https://esm.sh/lit/directives/map.js";
import { _ } from "/modules/Delusoire/stdlib/deps.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
const History = S.Platform.getHistory();
class _GenreLink extends LitElement {
	static styles = css`
        :host > a {
            color: var(--spice-subtext);
            font-size: var(--genre-link-size);
        }
    `;
	genre = "No Genre";
	openPlaylistsSearch() {
		History.push({
			pathname: `/search/${this.genre}/playlists`,
		});
	}
	render() {
		return html`<a href="#" @click=${this.openPlaylistsSearch}>${_.startCase(this.genre)}</a>`;
	}
}
_ts_decorate([property()], _GenreLink.prototype, "genre", void 0);
_GenreLink = _ts_decorate([customElement("genre-link")], _GenreLink);
class _ArtistGenreContainer extends LitElement {
	name = undefined;
	uri = undefined;
	genres = [];
	isSmall = true;
	fetchGenres = () => Promise.resolve([]);
	async willUpdate(changedProperties) {
		if (changedProperties.has("uri") && this.uri) {
			this.genres = await this.fetchGenres();
		}
	}
	render() {
		const artistGenreLinks = map(this.genres, genre => html`<genre-link genre=${genre} />`);
		const divider = () => html`<span>, </span>`;
		return html`<style>
                a {
                    --genre-link-size: ${this.isSmall ? "12px" : "1rem"};
                }
            </style>
            <div className="Ydwa1P5GkCggtLlSvphs genre-container">
                ${this.name && html`<span>${this.name} : </span>`} ${join(artistGenreLinks, divider)}
            </div>`;
	}
}
_ts_decorate([property()], _ArtistGenreContainer.prototype, "name", void 0);
_ts_decorate([property()], _ArtistGenreContainer.prototype, "uri", void 0);
_ts_decorate([state()], _ArtistGenreContainer.prototype, "genres", void 0);
_ts_decorate(
	[
		property({
			type: Boolean,
		}),
	],
	_ArtistGenreContainer.prototype,
	"isSmall",
	void 0,
);
_ts_decorate([property()], _ArtistGenreContainer.prototype, "fetchGenres", void 0);
_ArtistGenreContainer = _ts_decorate([customElement("genre-container")], _ArtistGenreContainer);
