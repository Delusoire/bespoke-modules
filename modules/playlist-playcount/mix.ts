import type { Transformer } from "/hooks/index.ts";

type ColumnKey = string;
type SortKey = string;

export enum SortOrder {
	NONE,
	ASC,
	DESC,
	SECONDARY_ASC,
	SECONDARY_DESC,
}

export type SortOptions = { column: ColumnKey; order: SortOrder };
type SortKeyToDefaultSortOptionsMap = Record<SortKey, SortOptions>;

type SortKeyToColumnKeyMap = Record<SortKey, ColumnKey>;

type SortProps = { key: SortKey; value: string };
type ColumnKeyToSortPropsMap = Record<ColumnKey, SortProps>;

type SortField = { column: string; order: string };
type ColumnKeyToSortFieldColumnMap = Record<ColumnKey, SortField["column"]>;

type Identity<T> = (x: T) => T;

declare global {
	var __patchSortKeyToDefaultSortOptionsMap: Identity<
		SortKeyToDefaultSortOptionsMap
	>;
	var __patchSortKeyToColumnKeyMap: Identity<SortKeyToColumnKeyMap>;
	var __patchColumnKeyToSortPropsMap: Identity<ColumnKeyToSortPropsMap>;
	var __patchColumnKeyToSortFieldMap: Identity<
		ColumnKeyToSortFieldColumnMap
	>;
}

export const CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP:
	SortKeyToDefaultSortOptionsMap = {};
export const CUSTOM_SORT_KEY_TO_COLUMN_KEY_MAP: SortKeyToColumnKeyMap = {};
export const CUSTOM_COLUMN_KEY_TO_SORT_PROPS_MAP: ColumnKeyToSortPropsMap = {};
export const CUSTOM_COLUMN_KEY_TO_SORT_FIELD_MAP:
	ColumnKeyToSortFieldColumnMap = {};

globalThis.__patchSortKeyToDefaultSortOptionsMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP);
	return x;
};

globalThis.__patchSortKeyToColumnKeyMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_SORT_KEY_TO_COLUMN_KEY_MAP);
	return x;
};

globalThis.__patchColumnKeyToSortPropsMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_COLUMN_KEY_TO_SORT_PROPS_MAP);
	return x;
};

globalThis.__patchColumnKeyToSortFieldMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_COLUMN_KEY_TO_SORT_FIELD_MAP);
	return x;
};

export default async function (transformer: Transformer) {
	transformer((emit) => (str) => {
		str = str.replace(
			/({"custom-order":[^{}]*(?:{[^{}]*}[^{}]*)*})/,
			"globalThis.__patchSortKeyToDefaultSortOptionsMap($1)",
		);
		str = str.replace(
			/(\{[\w\$\.\"\-\:\,]*\btitle:[a-zA-Z_\$][\w\$\.]*\.TITLE,[\w\$\.\"\-\:\,]*\})/,
			"globalThis.__patchSortKeyToColumnKeyMap($1)",
		);
		str = str.replace(
			/({\[[a-zA-Z_\$][\w\$\.]*\.INDEX\]:[^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*})/,
			"globalThis.__patchColumnKeyToSortPropsMap($1)",
		);
		emit();
		return str;
	}, {
		glob: /^\/5150\.js$/,
	});

	transformer((emit) => (str) => {
		str = str.replace(
			/(\{[\w\$\.\"\:\,\[\]]*\[r\.\$\.TITLE\]:[a-zA-Z_\$][\w\$\.]*\.TITLE,[\w\$\.\"\:\,\[\]]*\})/,
			"globalThis.__patchColumnKeyToSortFieldMap($1)",
		);
		emit();
		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
