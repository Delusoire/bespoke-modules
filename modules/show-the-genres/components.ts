import { css, html, LitElement, PropertyValues } from "https://esm.sh/lit";
import { customElement, property, state } from "https://esm.sh/lit/decorators.js";
import { join } from "https://esm.sh/lit/directives/join.js";
import { map } from "https://esm.sh/lit/directives/map.js";

import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { startCase } from "/modules/stdlib/deps.ts";

const History = Platform.getHistory();

declare global {
	interface HTMLElementTagNameMap {
		"genre-container": _ArtistGenreContainer;
		"genre-link": _GenreLink;
	}
}

@customElement("genre-link")
class _GenreLink extends LitElement {
	static override styles = css`
        :host > a {
            color: var(--spice-subtext);
            font-size: var(--genre-link-size);
        }
    `;

	@property()
	accessor genre = "No Genre";

	private openPlaylistsSearch() {
		History.push({ pathname: `/search/${this.genre}/playlists` });
	}

	protected override render() {
		return html`<a href="#" @click=${this.openPlaylistsSearch}>${startCase(this.genre)}</a>`;
	}
}

@customElement("genre-container")
class _ArtistGenreContainer extends LitElement {
	@property()
	accessor name: string | undefined;

	@property()
	accessor uri: string | undefined;

	@state()
	accessor genres: string[] = [];

	@property({ type: Boolean })
	accessor isSmall = true;

	@property()
	accessor fetchGenres = (_uri: string) => Promise.resolve([] as string[]);

	protected override async willUpdate(changedProperties: PropertyValues<this>) {
		if (changedProperties.has("uri") && this.uri) {
			this.genres = await this.fetchGenres(this.uri);
		}
	}

	protected override render() {
		const artistGenreLinks = map(
			this.genres,
			(genre) => html`<genre-link genre=${genre} />`,
		);
		const divider = () => html`<span>, </span>`;

		return html`<style>
                a {
                    --genre-link-size: ${this.isSmall ? "12px" : "1rem"};
                }
            </style>
            <div className="main-entityHeader-detailsText genre-container">
                ${this.name && html`<span>${this.name} : </span>`} ${join(artistGenreLinks, divider)}
            </div>`;
	}
}
