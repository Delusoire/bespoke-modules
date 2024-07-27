import { PlaycountWrapper, PopularityWrapper, ReleaseDateWrapper, ScrobblesWrapper } from "./components.tsx";
import { CONFIG } from "./settings.ts";
import {
	COLUMN_TYPES_PLAYLISTS,
	CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP,
	CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP,
	CUSTOM_COLUMNS,
	CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP,
	CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP,
	SortOrder,
} from "/modules/Delusoire.tracklist-columns/mix.ts";

const PLAYCOUNT_COLUMN = {
	type: "MC_PLAYCOUNT",
	label: "MC - Playcount",
	render: PlaycountWrapper,
};
const RELEASE_DATE_COLUMN = {
	type: "MC_RELEASE_DATE",
	label: "MC - Release Date",
	render: ReleaseDateWrapper,
};
const POPULARITY_COLUMN = {
	type: "MC_POPULARITY",
	label: "MC - Popularity",
	render: PopularityWrapper,
};
const SCROBBLES_COLUMN = {
	type: "MC_SCROBBLES",
	label: "MC - Scrobbles",
	render: ScrobblesWrapper,
};

const PLAYCOUNT_SORT = {
	key: "mc-playcount",
	label: "MC - Playcount",
};
const RELEASE_DATE_SORT = {
	key: "mc-release-date",
	label: "MC - Release Date",
};
const POPULARITY_SORT = {
	key: "mc-popularity",
	label: "MC - Popularity",
};
const SCROBBLES_SORT = {
	key: "mc-scrobbles",
	label: "MC - Scrobbles",
};

export const PLAYCOUNT_SORT_FIELD = "MC_PLAYCOUNT";
export const RELEASE_DATE_SORT_FIELD = "MC-RELEASE_DATE";
export const POPULARITY_SORT_FIELD = "MC-POPULARITY";
export const SCROBBLES_SORT_FIELD = "MC-SCROBBLES";

export function load() {
	CUSTOM_COLUMNS[PLAYCOUNT_COLUMN.type] = PLAYCOUNT_COLUMN;
	CUSTOM_COLUMNS[RELEASE_DATE_COLUMN.type] = RELEASE_DATE_COLUMN;
	CUSTOM_COLUMNS[POPULARITY_COLUMN.type] = POPULARITY_COLUMN;
	CUSTOM_COLUMNS[SCROBBLES_COLUMN.type] = SCROBBLES_COLUMN;

	COLUMN_TYPES_PLAYLISTS.set(PLAYCOUNT_COLUMN.type, () => CONFIG.enablePlaycount);
	COLUMN_TYPES_PLAYLISTS.set(RELEASE_DATE_COLUMN.type, () => CONFIG.enableReleaseDate);
	COLUMN_TYPES_PLAYLISTS.set(POPULARITY_COLUMN.type, () => CONFIG.enablePopularity);
	COLUMN_TYPES_PLAYLISTS.set(SCROBBLES_COLUMN.type, () => CONFIG.enableScrobbles);

	CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[PLAYCOUNT_COLUMN.type] = {
		key: PLAYCOUNT_SORT.key,
		value: PLAYCOUNT_SORT.label,
	};
	CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[RELEASE_DATE_COLUMN.type] = {
		key: RELEASE_DATE_SORT.key,
		value: RELEASE_DATE_SORT.label,
	};
	CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[POPULARITY_COLUMN.type] = {
		key: POPULARITY_SORT.key,
		value: POPULARITY_SORT.label,
	};
	CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[SCROBBLES_COLUMN.type] = {
		key: SCROBBLES_SORT.key,
		value: SCROBBLES_SORT.label,
	};

	CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[PLAYCOUNT_SORT.key] = PLAYCOUNT_COLUMN.type;
	CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[RELEASE_DATE_SORT.key] = RELEASE_DATE_COLUMN.type;
	CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[POPULARITY_SORT.key] = POPULARITY_COLUMN.type;
	CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[SCROBBLES_SORT.key] = SCROBBLES_COLUMN.type;

	CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[PLAYCOUNT_SORT.key] = {
		column: PLAYCOUNT_COLUMN.type,
		order: SortOrder.DESC,
	};
	CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[RELEASE_DATE_SORT.key] = {
		column: RELEASE_DATE_COLUMN.type,
		order: SortOrder.DESC,
	};
	CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[POPULARITY_SORT.key] = {
		column: POPULARITY_COLUMN.type,
		order: SortOrder.DESC,
	};
	CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[SCROBBLES_SORT.key] = {
		column: SCROBBLES_COLUMN.type,
		order: SortOrder.DESC,
	};

	CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[PLAYCOUNT_COLUMN.type] = PLAYCOUNT_SORT_FIELD;
	CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[RELEASE_DATE_COLUMN.type] = RELEASE_DATE_SORT_FIELD;
	CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[POPULARITY_COLUMN.type] = POPULARITY_SORT_FIELD;
	CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[SCROBBLES_COLUMN.type] = SCROBBLES_SORT_FIELD;
}

export function unload() {
	delete CUSTOM_COLUMNS[PLAYCOUNT_COLUMN.type];
	delete CUSTOM_COLUMNS[RELEASE_DATE_COLUMN.type];
	delete CUSTOM_COLUMNS[POPULARITY_COLUMN.type];
	delete CUSTOM_COLUMNS[SCROBBLES_COLUMN.type];

	COLUMN_TYPES_PLAYLISTS.delete(PLAYCOUNT_COLUMN.type);
	COLUMN_TYPES_PLAYLISTS.delete(RELEASE_DATE_COLUMN.type);
	COLUMN_TYPES_PLAYLISTS.delete(POPULARITY_COLUMN.type);
	COLUMN_TYPES_PLAYLISTS.delete(SCROBBLES_COLUMN.type);

	delete CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[PLAYCOUNT_COLUMN.type];
	delete CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[RELEASE_DATE_COLUMN.type];
	delete CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[POPULARITY_COLUMN.type];
	delete CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[SCROBBLES_COLUMN.type];

	delete CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[PLAYCOUNT_SORT.key];
	delete CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[RELEASE_DATE_SORT.key];
	delete CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[POPULARITY_SORT.key];
	delete CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP[SCROBBLES_SORT.key];

	delete CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[PLAYCOUNT_SORT.key];
	delete CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[RELEASE_DATE_SORT.key];
	delete CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[POPULARITY_SORT.key];
	delete CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP[SCROBBLES_SORT.key];

	delete CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[PLAYCOUNT_COLUMN.type];
	delete CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[RELEASE_DATE_COLUMN.type];
	delete CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[POPULARITY_COLUMN.type];
	delete CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP[SCROBBLES_COLUMN.type];
}
