import { Transformer } from "/hooks/transform.ts";

type RenderRow = (data: any, index: number) => React.ReactElement;

declare global {
	var __patchTracklistWrapperProps: <A extends { renderRow: RenderRow; columns: string[] }>(props: A) => A;
	var __patchRenderTracklistRowColumn: (column: string) => React.ReactNode;
	var __patchTracklistColumnHeaderContextMenu: (column: string) => React.FC<{}>;
	var __patchTracklistColumns: (columns: string[]) => string[];
}

globalThis.__patchTracklistWrapperProps = (x) => x;
globalThis.__patchRenderTracklistRowColumn = () => null;
globalThis.__patchTracklistColumnHeaderContextMenu = () => () => undefined;
globalThis.__patchTracklistColumns = (x) => x;

export default function (transformer: Transformer) {
	transformer((emit) => (str) => {
		str = str.replace(/(tracks,[^;]*nrTracks),/, "$1,e=__patchTracklistWrapperProps(e),");

		str = str.replaceAll(
			/(switch\(([a-zA-Z_\$][\w\$]*)\){case [a-zA-Z_\$][\w\$]*\.[a-zA-Z_\$][\w\$]*\.INDEX:.*?default):/g,
			"$1:return __patchRenderTracklistRowColumn($2);",
		);

		str = str.replace(
			/([a-zA-Z_\$][\w\$]*)=([a-zA-Z_\$][\w\$]*)\[([a-zA-Z_\$][\w\$]*)\],(?=.*\.jsxs?\)\(\1,[^;]*columnIndex:)/,
			"$1=$2[$3]??__patchTracklistColumnHeaderContextMenu($3),",
		);

		str = str.replace(
			/=e\.columns,(.{0,100}),toggleable:([^,}]+)/,
			"=__patchTracklistColumns(e.columns),$1,toggleable:$2??true",
		);

		emit();

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
