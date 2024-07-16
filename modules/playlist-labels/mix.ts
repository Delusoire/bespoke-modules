import { Transformer } from "/hooks/transform.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";

type RenderRow = (data: any, index: number) => React.ReactElement;

declare global {
	var __patchTracklistWrapperProps: <
		A extends { renderRow: RenderRow; columns: string[] },
	>(props: A) => A;
	var __patchRenderTracklistRowColumn: (column: string) => React.ReactNode;
	var __patchTracklistColumnHeaderContextMenu: (
		column: string,
	) => React.FC<{}>;
	var __patchTracklistColumns: (columns: string[]) => string[];
}

globalThis.__patchTracklistWrapperProps = (x) => {
	React.useCallback(() => null, [false, x.renderRow]);
	return x;
};
globalThis.__patchRenderTracklistRowColumn = () => null;
globalThis.__patchTracklistColumnHeaderContextMenu = () => () => undefined;
globalThis.__patchTracklistColumns = (x) => {
	React.useMemo(() => null, [false, x]);
	return x;
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

		emit();

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});

	// <3
	transformer((emit) => (str) => {
		str = str.replaceAll(
			`"<path d='M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12zm16.398-2.38a1 1 0 0 0-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 0 0-1.414 1.414l3.308 3.308 7.425-7.425z'/>"`,
			`"<path d='M496.2,251c-2.1-3.3-5.6-0.7-16.1-5.7c-31.7-15.2-34.6-48.7-70.3-86.3c-22.4-23.5-64.9-54.3-77.1-61.6  c-54.9-32.5-60.6,20.7-98.6,2.6c-10-4.8-26.6-22.6-60.2-6.5c-16.3,7.8-59.6,40.9-78.9,59.9c-41.3,40.7-43.3,77.7-77.5,92.7  c-10.1,4.1-12.2,1.9-14.2,4.7c-1.6,2.1-0.3,5.2,1.8,6c40.7,25.1,91.4-12.4,135-26.7c-12.3-36.6-19.5-43.6-21.7-62.4  c2.3-1.1,11.4,13.9,14.5,24c3.7,13.2,8.2,21.1,10.9,37c11.1-3.5,18-5.3,30.1-7.5c-8.8-19.9-14.7-48.1-8.7-69.1  c4.2,0,3.8,35.1,13.6,68.4c7.5-1.3,15.7-2.4,23.3-2.4c-15.9-29.5-8.7-46.5-6.7-46.4c5.9,16,2.5,23.2,9,43.3  c1.7,5.4-1.6,1.4,17.8,5.6c5.9,1.3,9.1,2,14.8,3c7.3,2,3.1,3-1-28.5c-0.8-6.1-3.8-21.4,3.5-38c4.1,0.5,1.1,35.9,7.1,68.5  c2.7,0.4,2.7,0.4,5.5,0.3c-1.9-15.5-3.8-35.2,2.4-48.3c2.6,0.1,4,14.5,3.6,20.3c-1.5,16.4-0.9,11.3-2.2,27.8c12.5-1.1,16.2-5,28.9-7  c1.8-0.3,2.2-29.5,8.3-29.9c5,7,3.2,15.3-2.1,29.5c7.6-0.7,11.2-0.4,18.8,0.6c12.3-33.2,18.1-73.6,21.8-73.6  c5.9,23.8-4.2,52.9-15.4,74.4c20.3,3,40.4,8.4,61.6,17.1c18.6-16.4,33.2-41.4,36.7-39.5c-2.7,17.2-16.8,32.2-31.7,41.4  c28,11.8,69.4,38.3,107.2,20.4C493.5,257.5,498.8,255,496.2,251z M310.1,163.7c-1.2,8.2-1.3,11.9-5.2,26.3c-1.8-0.2,0,1.6-1.3-21.1  c-0.2-3.2-2.4-11.2,1.3-20.9C306.8,147.7,310.9,156.7,310.1,163.7z M375.5,184.6c-3.4,7.9-16,32.9-20.4,30.9  c0-0.1,4.1-2.9,10.9-22.7c1.2-3.4,7.5-31.2,10.9-30.8C378.6,168,378.5,177.3,375.5,184.6z M496.1,274.4c-2.1-9.8-25.6,9.1-88.4-6.6  c-25.7-6.4-53.6-17.2-81.9-11.9c-23.2,4.3-34,16.2-46.4,23.9c-11,6.8-3.3-4.2,0.7,27c0.9,6.8,3.6,20.9-5.6,35.3  c-3.5-0.9,1.1-31.8-5.2-56.9c-23.7,10.2-40.7-3.2-42.4-3.4c-14-7.5-22.2-18.5-43.6-24.5c-36.5-10.2-71.6,9-109,14.6  c-49.3,7.3-66.2-6.3-67.6,2.5c-1.3,1.2-2,3.4-0.8,5c29.6,39.2,76,75.5,118.4,105.8c59.9,42.7,104.1,24.6,118,22.6  c42-6.2,63.6,32.6,154.2-35.9c37.4-28.3,72.6-55.6,100.5-92.5C498,278,497.4,275.6,496.1,274.4z M87.4,327.2  c-2.6-13.3,2.5-30,12.1-39.5C97.9,296.5,91.1,318.8,87.4,327.2z M138.4,312.2c-1.3,11.1,0.2,24.9-1.9,40c-3.9,0.8-14.1-34,8.9-70.6  C147.3,282.5,141.3,288.8,138.4,312.2z M166.2,344.6c0,0.4-1.3,39.1-4.2,39.3c-8.8-23.5,1.3-58.4,10.7-78.3  C174.8,306.4,169,314.2,166.2,344.6z M335.4,346.7c-2.2,30.5-15,43.8-13.3,43.2c0.4-0.2,0,0.5,0.5-0.6c1.3,0.5,0,2.3-1.1,2  c-5-1.9,10.5-35.7,10.4-78.8c-0.1-27.5-3.7-26.6-1.4-27.1C335.9,305.2,337.2,326.2,335.4,346.7z M381.3,345.2  c-4.7-28.7-0.5-59.8-2.5-59.4C381.4,282.9,389.1,318.3,381.3,345.2z' transform='scale(0.05)'><path/>"`,
		);

		str = str.replaceAll(
			`"<path d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z'/>"`,
			`"<path d='M496.2,251c-2.1-3.3-5.6-0.7-16.1-5.7c-31.7-15.2-34.6-48.7-70.3-86.3c-22.4-23.5-64.9-54.3-77.1-61.6  c-54.9-32.5-60.6,20.7-98.6,2.6c-10-4.8-26.6-22.6-60.2-6.5c-16.3,7.8-59.6,40.9-78.9,59.9c-41.3,40.7-43.3,77.7-77.5,92.7  c-10.1,4.1-12.2,1.9-14.2,4.7c-1.6,2.1-0.3,5.2,1.8,6c40.7,25.1,91.4-12.4,135-26.7c-12.3-36.6-19.5-43.6-21.7-62.4  c2.3-1.1,11.4,13.9,14.5,24c3.7,13.2,8.2,21.1,10.9,37c11.1-3.5,18-5.3,30.1-7.5c-8.8-19.9-14.7-48.1-8.7-69.1  c4.2,0,3.8,35.1,13.6,68.4c7.5-1.3,15.7-2.4,23.3-2.4c-15.9-29.5-8.7-46.5-6.7-46.4c5.9,16,2.5,23.2,9,43.3  c1.7,5.4-1.6,1.4,17.8,5.6c5.9,1.3,9.1,2,14.8,3c7.3,2,3.1,3-1-28.5c-0.8-6.1-3.8-21.4,3.5-38c4.1,0.5,1.1,35.9,7.1,68.5  c2.7,0.4,2.7,0.4,5.5,0.3c-1.9-15.5-3.8-35.2,2.4-48.3c2.6,0.1,4,14.5,3.6,20.3c-1.5,16.4-0.9,11.3-2.2,27.8c12.5-1.1,16.2-5,28.9-7  c1.8-0.3,2.2-29.5,8.3-29.9c5,7,3.2,15.3-2.1,29.5c7.6-0.7,11.2-0.4,18.8,0.6c12.3-33.2,18.1-73.6,21.8-73.6  c5.9,23.8-4.2,52.9-15.4,74.4c20.3,3,40.4,8.4,61.6,17.1c18.6-16.4,33.2-41.4,36.7-39.5c-2.7,17.2-16.8,32.2-31.7,41.4  c28,11.8,69.4,38.3,107.2,20.4C493.5,257.5,498.8,255,496.2,251z M310.1,163.7c-1.2,8.2-1.3,11.9-5.2,26.3c-1.8-0.2,0,1.6-1.3-21.1  c-0.2-3.2-2.4-11.2,1.3-20.9C306.8,147.7,310.9,156.7,310.1,163.7z M375.5,184.6c-3.4,7.9-16,32.9-20.4,30.9  c0-0.1,4.1-2.9,10.9-22.7c1.2-3.4,7.5-31.2,10.9-30.8C378.6,168,378.5,177.3,375.5,184.6z M496.1,274.4c-2.1-9.8-25.6,9.1-88.4-6.6  c-25.7-6.4-53.6-17.2-81.9-11.9c-23.2,4.3-34,16.2-46.4,23.9c-11,6.8-3.3-4.2,0.7,27c0.9,6.8,3.6,20.9-5.6,35.3  c-3.5-0.9,1.1-31.8-5.2-56.9c-23.7,10.2-40.7-3.2-42.4-3.4c-14-7.5-22.2-18.5-43.6-24.5c-36.5-10.2-71.6,9-109,14.6  c-49.3,7.3-66.2-6.3-67.6,2.5c-1.3,1.2-2,3.4-0.8,5c29.6,39.2,76,75.5,118.4,105.8c59.9,42.7,104.1,24.6,118,22.6  c42-6.2,63.6,32.6,154.2-35.9c37.4-28.3,72.6-55.6,100.5-92.5C498,278,497.4,275.6,496.1,274.4z M87.4,327.2  c-2.6-13.3,2.5-30,12.1-39.5C97.9,296.5,91.1,318.8,87.4,327.2z M138.4,312.2c-1.3,11.1,0.2,24.9-1.9,40c-3.9,0.8-14.1-34,8.9-70.6  C147.3,282.5,141.3,288.8,138.4,312.2z M166.2,344.6c0,0.4-1.3,39.1-4.2,39.3c-8.8-23.5,1.3-58.4,10.7-78.3  C174.8,306.4,169,314.2,166.2,344.6z M335.4,346.7c-2.2,30.5-15,43.8-13.3,43.2c0.4-0.2,0,0.5,0.5-0.6c1.3,0.5,0,2.3-1.1,2  c-5-1.9,10.5-35.7,10.4-78.8c-0.1-27.5-3.7-26.6-1.4-27.1C335.9,305.2,337.2,326.2,335.4,346.7z M381.3,345.2  c-4.7-28.7-0.5-59.8-2.5-59.4C381.4,282.9,389.1,318.3,381.3,345.2z' transform='scale(0.04) translate(-40,0)'><path/>"`,
		);
		emit();
		return str;
	}, {
		noAwait: true,
	});
}
