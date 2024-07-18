import type { Transformer } from "/hooks/index.ts";

type ColumnType = string;
type SortKey = string;

export enum SortOrder {
	NONE,
	ASC,
	DESC,
	SECONDARY_ASC,
	SECONDARY_DESC,
}

type SortProps = { key: SortKey; value: string; };
type ColumnTypeToSortPropsMap = Record<ColumnType, SortProps>;

export type SortState = { column: ColumnType; order: SortOrder; };
type SortKeyToDefaultSortOptionsMap = Record<SortKey, SortState>;

type SortKeyToColumnTypeMap = Record<SortKey, ColumnType>;

type SortField = { column: string; order: string; };
type ColumnTypeToSortFieldColumnMap = Record<ColumnType, SortField["column"]>;

type Identity<T> = (x: T) => T;

declare global {
	var __patchColumnTypeToSortPropsMap: Identity<ColumnTypeToSortPropsMap>;
	var __patchSortKeyToDefaultSortOptionsMap: Identity<
		SortKeyToDefaultSortOptionsMap
	>;
	var __patchSortKeyToColumnTypeMap: Identity<SortKeyToColumnTypeMap>;
	var __patchColumnTypeToSortFieldMap: Identity<
		ColumnTypeToSortFieldColumnMap
	>;
}
export const CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP: ColumnTypeToSortPropsMap =
	{};
export const CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP:
	SortKeyToDefaultSortOptionsMap = {};
export const CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP: SortKeyToColumnTypeMap = {};
export const CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP:
	ColumnTypeToSortFieldColumnMap = {};

globalThis.__patchColumnTypeToSortPropsMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP);
	return x;
};

globalThis.__patchSortKeyToDefaultSortOptionsMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP);
	return x;
};

globalThis.__patchSortKeyToColumnTypeMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP);
	return x;
};

globalThis.__patchColumnTypeToSortFieldMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP);
	return x;
};

export default async function (transformer: Transformer) {
	transformer((emit) => (str) => {
		str = str.replace(
			/({\[[a-zA-Z_\$][\w\$\.]*\.INDEX\]:[^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*})/,
			"globalThis.__patchColumnTypeToSortPropsMap($1)",
		);
		str = str.replace(
			/({"custom-order":[^{}]*(?:{[^{}]*}[^{}]*)*})/,
			"globalThis.__patchSortKeyToDefaultSortOptionsMap($1)",
		);
		str = str.replace(
			/(\{[\w\$\.\"\-\:\,]*\btitle:[a-zA-Z_\$][\w\$\.]*\.TITLE,[\w\$\.\"\-\:\,]*\})/,
			"globalThis.__patchSortKeyToColumnTypeMap($1)",
		);
		emit();
		return str;
	}, {
		glob: /^\/5150\.js$/,
		noAwait: true,
	});

	transformer((emit) => (str) => {
		str = str.replace(
			/(\{[\w\$\.\"\:\,\[\]]*\[r\.\$\.TITLE\]:[a-zA-Z_\$][\w\$\.]*\.TITLE,[\w\$\.\"\:\,\[\]]*\})/,
			"globalThis.__patchColumnTypeToSortFieldMap($1)",
		);
		emit();
		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
