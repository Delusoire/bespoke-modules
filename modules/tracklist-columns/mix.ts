import type { Transformer } from "/hooks/index.ts";

import { React } from "/modules/stdlib/src/expose/React.ts";

export interface Column {
	key: string;
	label: string;
	render: React.FC<{ data: Data }>;
	cond: (options: Options) => boolean;
}

export type Data = any;
type Options = any;

type Identity<T> = (x: T) => T;
type RenderRow = (data: Data, index: number) => React.ReactNode;

export const CUSTOM_COLUMNS: Record<Column["key"], Column> = {};
export const COLUMN_KEYS_EVERYWHERE = new Set<Column["key"]>();

declare global {
	var __patchTracklistWrapperProps: Identity<
		{ renderRow: RenderRow; columns: string[] }
	>;
	var __patchRenderTracklistRowColumn: (columnKey: string) => React.ReactNode;
	var __patchTracklistColumnHeaderContextMenu: (
		columnKey: string,
	) => React.FC<{}>;
	var __patchTracklistColumns: Identity<string[]>;
	var __patchColumnKeyToColumnLabelMap: Identity<Record<string, string>>;
}

globalThis.__patchTracklistWrapperProps = (x) => {
	React.useCallback(() => null, [false, x.renderRow]);
	return x;
};
globalThis.__patchRenderTracklistRowColumn = () => undefined;
globalThis.__patchTracklistColumnHeaderContextMenu = () => () => undefined;
globalThis.__patchTracklistColumns = (columns) => {
	const i = -1;
	return React.useMemo(
		() => [
			...columns.slice(0, i),
			...COLUMN_KEYS_EVERYWHERE,
			...columns.slice(i),
		],
		[columns],
	);
};

export const CUSTOM_COLUMN_KEY_TO_COLUMN_LABEL_MAP: Record<string, string> = {};
globalThis.__patchColumnKeyToColumnLabelMap = (x) => {
	Object.setPrototypeOf(x, CUSTOM_COLUMN_KEY_TO_COLUMN_LABEL_MAP);
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
			"globalThis.__patchColumnKeyToColumnLabelMap($1)",
		);

		emit();

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
