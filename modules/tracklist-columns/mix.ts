import type { Transformer } from "/hooks/index.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

export interface Column {
	type: string;
	label: string;
	render: React.FC<{ data: Data }>;
}

export type Data = any;
export type Options = any;

type Identity<T> = (x: T) => T;
type RenderRow = (data: Data, index: number) => React.ReactNode;

export const CUSTOM_COLUMNS: Record<Column["type"], Column> = {};
export const COLUMN_TYPES_EVERYWHERE = new Set<Column["type"]>();
export const COLUMN_TYPES_PLAYLISTS = new Map<Column["type"], (options: Options) => boolean>();

declare global {
	var __patchTracklistWrapperProps: Identity<
		{ renderRow: RenderRow; columns: string[] }
	>;
	var __patchRenderTracklistRowColumn: (columnType: string) => React.ReactNode;
	var __patchTracklistColumnHeaderContextMenu: (
		columnType: string,
	) => React.FC<{}>;
	var __patchTracklistColumnsProvider: Identity<string[]>;
	var __patchColumnTypeToColumnLabelMap: Identity<Record<string, string>>;
}

globalThis.__patchTracklistWrapperProps = (x) => {
	React.useCallback(() => null, [false, x.renderRow]);
	return x;
};
globalThis.__patchRenderTracklistRowColumn = () => undefined;
globalThis.__patchTracklistColumnHeaderContextMenu = () => () => undefined;
globalThis.__patchTracklistColumnsProvider = (columns) => {
	const i = -1;
	return React.useMemo(
		() => [
			...columns.slice(0, i),
			...COLUMN_TYPES_EVERYWHERE,
			...columns.slice(i),
		],
		[columns],
	);
};

globalThis.__patchColumnTypeToColumnLabelMap = (x) => {
	return new Proxy(x, {
		get: (target, p, receiver) => {
			return Reflect.get(target, p, receiver) ?? CUSTOM_COLUMNS[p].label;
		},
	});
};

function tracklistColumn(transformer: Transformer) {
	transformer((emit) => (str) => {
		str = str.replace(
			/(\(0,([a-zA-Z_\$][\w\$]*)\.jsx\)\([a-zA-Z_\$][\w\$]*\.[a-zA-Z_\$][\w\$]*,{resolveItem:[a-zA-Z_\$][\w\$]*,getItems:[a-zA-Z_\$][\w\$]*,nrTracks:[a-zA-Z_\$][\w\$]*),children:\(0,\2\.jsx\)/,
			"$1,children:((type,props)=>($2.jsx(type,__patchTracklistWrapperProps(props))))",
		);

		str = str.replaceAll(
			/(switch\(([a-zA-Z_\$][\w\$]*)\){case [a-zA-Z_\$][\w\$]*\.[a-zA-Z_\$][\w\$]*\.INDEX:.*?default):/g,
			"$1:return __patchRenderTracklistRowColumn($2);",
		);

		str = str.replace(
			/([a-zA-Z_\$][\w\$]*)=([a-zA-Z_\$][\w\$]*)\[([a-zA-Z_\$][\w\$]*)\],(?=.*\.jsxs?\)\(\1,[^;]*columnIndex:)/,
			"$1=$2[$3]??__patchTracklistColumnHeaderContextMenu($3),",
		);

		str = str.replace(
			/{(?=[^{}]*(?:{[^{}]*}[^{}]*)*(?<=[,{])columnType:)(?=[^{}]*(?:{[^{}]*}[^{}]*)*(?<=[,{])visible:)(?=[^{}]*(?:{[^{}]*}[^{}]*)*(?<=[,{])toggleable:)(?=[^{}]*(?:{[^{}]*}[^{}]*)*(?<=[,{])options:)([^{}]*(?:{[^{}]*}[^{}]*)*(?<=[,{]))toggleable:((?:[^{}]*{[^{}]*})*?[^,{}]*)(,[^{}]*(?:{[^{}]*}[^{}]*)*|)}/,
			"{$1toggleable:($2)??true$3}",
		);

		str = str.replace(
			/{(\[[a-zA-Z_\$][\w\$]*\.[a-zA-Z_\$][\w\$]*\.INDEX\]:[^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*)}/,
			"globalThis.__patchColumnTypeToColumnLabelMap({$1})",
		);

		emit();

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}

///

type ColumnType = string;
type SortKey = string;

export enum SortOrder {
	NONE,
	ASC,
	DESC,
	SECONDARY_ASC,
	SECONDARY_DESC,
}

type SortProps = { key: SortKey; value: string };
type ColumnTypeToSortPropsMap = Record<ColumnType, SortProps>;

export type SortState = { column: ColumnType; order: SortOrder };
type SortKeyToDefaultSortOptionsMap = Record<SortKey, SortState>;

type SortKeyToColumnTypeMap = Record<SortKey, ColumnType>;

type SortField = { column: string; order: string };
type ColumnTypeToSortFieldColumnMap = Record<ColumnType, SortField["column"]>;

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
export const CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP: ColumnTypeToSortPropsMap = {};
export const CUSTOM_SORT_KEY_TO_DEFAULT_SORT_OPTIONS_MAP: SortKeyToDefaultSortOptionsMap = {};
export const CUSTOM_SORT_KEY_TO_COLUMN_TYPE_MAP: SortKeyToColumnTypeMap = {};
export const CUSTOM_COLUMN_TYPE_TO_SORT_FIELD_MAP: ColumnTypeToSortFieldColumnMap = {};

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

function tracklistSort(transformer: Transformer) {
	transformer((emit) => (str) => {
		emit();

		str = str.replace(
			/{((?=[^{}]*(?:{[^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*}[^{}]*)*(?<=[,{])\[([a-zA-Z_\$][\w\$]*\.){2}INDEX\]:{key:)(?=[^{}]*(?:{[^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*}[^{}]*)*(?<=[,{])\[([a-zA-Z_\$][\w\$]*\.){2}TITLE\]:{key:)[^{}]*(?:{[^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*}[^{}]*)*)}/,
			"globalThis.__patchColumnTypeToSortPropsMap({$1})",
		);
		str = str.replace(
			/{("custom-order":[^{}]*(?:{[^{}]*}[^{}]*)*)}/,
			"globalThis.__patchSortKeyToDefaultSortOptionsMap({$1})",
		);
		str = str.replace(
			/{((?=[^{}]*(?<=[,{])title:[a-zA-Z_\$][\w\$\.]*\.TITLE[,}])(?=[^{}]*(?<=[,{])"title-and-artist-title":[a-zA-Z_\$][\w\$\.]*\.TITLE_AND_ARTIST[,}])[^{}]*)}/,
			"globalThis.__patchSortKeyToColumnTypeMap({$1})",
		);

		return str;
	}, {
		glob: /^\/.+\.js$/,
		wait: false,
	});

	transformer((emit) => (str) => {
		emit();

		str = str.replace(
			/{((?=[^{}]*(?<=[,{])\[([a-zA-Z_\$][\w\$]*\.){2}TITLE\]:([a-zA-Z_\$][\w\$]*\.){2}TITLE[,}])[^{}]*)}/,
			"globalThis.__patchColumnTypeToSortFieldMap({$1})",
		);

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}

///

export default async function (transformer: Transformer) {
	tracklistColumn(transformer);
	tracklistSort(transformer);
}
