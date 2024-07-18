import type { Transformer } from "/hooks/index.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

export interface Column {
	type: string;
	label: string;
	render: React.FC<{ data: Data }>;
	cond: (options: Options) => boolean;
}

export type Data = any;
type Options = any;

type Identity<T> = (x: T) => T;
type RenderRow = (data: Data, index: number) => React.ReactNode;

export const CUSTOM_COLUMNS: Record<Column["type"], Column> = {};
export const COLUMN_TYPES_EVERYWHERE = new Set<Column["type"]>();

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

export const CUSTOM_COLUMN_TYPE_TO_COLUMN_LABEL_MAP: Record<string, string> =
	{};
globalThis.__patchColumnTypeToColumnLabelMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_COLUMN_TYPE_TO_COLUMN_LABEL_MAP);
	return new Proxy(x, {
		get: (target, p, receiver) => {
			return Reflect.get(target, p, receiver) ?? CUSTOM_COLUMNS[p].label;
		},
	});
};

export default function (transformer: Transformer) {
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
			/\(\{(columnType:[a-zA-Z_\$][\w\$]*,visible:!0),toggleable:([^,})]+),/,
			"({$1,toggleable:$2??true,",
		);

		str = str.replace(
			/({\[[a-zA-Z_\$][\w\$]*\.[a-zA-Z_\$][\w\$]*\.INDEX\]:[^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*})/,
			"globalThis.__patchColumnTypeToColumnLabelMap($1)",
		);

		emit();

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
