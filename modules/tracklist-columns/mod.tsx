import { exports } from "/modules/stdlib/src/webpack/index.ts";
import { Module } from "/hooks/index.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { classnames } from "/modules/stdlib/src/webpack/ClassNames.ts";
import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.ts";
import {
	COLUMN_TYPES_EVERYWHERE,
	COLUMN_TYPES_PLAYLISTS,
	CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP,
	CUSTOM_COLUMNS,
	Data,
	Options,
} from "./mix.ts";
import { createContext } from "/modules/Delusoire.delulib/lib/react.ts";

const RowDataCtx = createContext<any>(null);

interface RowProps {
	data: Data;
	index: number;
	renderRow: (data: Data, index: number) => React.ReactNode;
}
const Row = React.memo((props: RowProps) => {
	return React.createElement(
		RowDataCtx().Provider,
		{ value: props.data },
		props.renderRow(props.data, props.index),
	);
});

globalThis.__patchTracklistWrapperProps = (props) => {
	const p = Object.assign({}, props);
	p.renderRow = React.useCallback(
		(data: Data, index: number) => (
			<Row
				key={index}
				data={data}
				index={index}
				renderRow={props.renderRow}
			/>
		),
		[true, props.renderRow],
	);
	return p;
};

globalThis.__patchRenderTracklistRowColumn = (columnType) => {
	const data = React.useContext(RowDataCtx());
	return React.createElement(CUSTOM_COLUMNS[columnType].render, {
		key: columnType,
		data,
	});
};

globalThis.__patchTracklistColumnHeaderContextMenu =
	(columnType) => ({ className, children, onSort, columnIndex }: any) => {
		const column = CUSTOM_COLUMNS[columnType];
		if (!column) {
			return;
		}

		const isSortable = CUSTOM_COLUMN_TYPE_TO_SORT_PROPS_MAP[columnType];

		return React.createElement(
			isSortable ? "button" : "div",
			{
				className: classnames(MAP.tracklist.column_header, className),
				onClick: () => isSortable && onSort(column.type, columnIndex),
			},
			<UI.Text
				variant="bodySmall"
				className={classnames(
					"standalone-ellipsis-one-line",
					className,
				)}
			>
				{column.label}
			</UI.Text>,
			children,
		);
	};

export default async function (mod: Module) {
	const [m, k, v] = exports
		.flatMap((m) => {
			const keys = Object.keys(m);
			for (const k of keys) {
				const v = m[k];
				if (typeof v !== "function") {
					continue;
				}
				const s = v.toString();
				if (
					!(s.includes("isMixedMedia") &&
						s.includes("hasEpisodes") &&
						s.includes("hasSpotifyAudiobooks"))
				) {
					continue;
				}
				return [[m, k, v]];
			}
			return [];
		})[0];

	if (!v[Symbol.for("patched")]) {
		Object.defineProperty(m, k, {
			enumerable: true,
			get: () =>
				function (options: Options) {
					const columns = v(options);
					const i = -1;
					return [
						...columns.slice(0, i),
						...Array.from(COLUMN_TYPES_PLAYLISTS).flatMap(([type, cond]) => cond(options) ? [type] : []),
						...columns.slice(i),
					];
				},
		});
		v[Symbol.for("patched")] = true;
	}

	return () => {
		for (const k of Object.keys(CUSTOM_COLUMNS)) {
			delete CUSTOM_COLUMNS[k];
		}
		COLUMN_TYPES_EVERYWHERE.clear();
	};
}
