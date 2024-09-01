import { Palette, type PaletteManager } from "../src/palette.ts";
import { startCase } from "/modules/stdlib/deps.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { Color } from "/modules/stdlib/src/webpack/misc.ts";
import { ColorSets } from "../src/webpack.ts";
import { useSyncedState } from "./shared.tsx";

export interface PaletteColorSetsProps {
	palette: Palette;
	paletteManager: PaletteManager;
}
export const PaletteColorSets = ({ palette, paletteManager }: PaletteColorSetsProps) => {
	return (
		<div className="palette__color-sets bg-[var(--secondary-bg)] p-[var(--gap-primary)] rounded-[var(--border-radius)] flex flex-col flex-nowrap overflow-y-auto h-[calc(100%-40px)] gap-y-1 gap-x-[var(--gap-secondary)]">
			{Object.entries(palette.data.getColors()).map(([set, colors]) => (
				<PaletteColorSet
					key={set}
					set={set as ColorSets}
					colors={colors}
					palette={palette}
					paletteManager={paletteManager}
				/>
			))}
		</div>
	);
};

export interface PaletteFieldProps {
	set: ColorSets;
	colors: Color[];
	palette: Palette;
	paletteManager: PaletteManager;
}
export const PaletteColorSet = ({ set, colors, palette, paletteManager }: PaletteFieldProps) => {
	return (
		<div className="palette__color-set flex items-center justify-between">
			<label>{startCase(set)}</label>
			<div className="color-set__color-inputs flex gap-[var(--gap-primary)] items-center">
				{colors.map((c, i) => (
					<PaletteColorInput
						color={c}
						palette={palette}
						set={set}
						key={i}
						index={i}
						paletteManager={paletteManager}
					/>
				))}
			</div>
		</div>
	);
};

export interface PaletteFieldColorProps {
	set: ColorSets;
	color: Color;
	palette: Palette;
	index: number;
	paletteManager: PaletteManager;
}
export const PaletteColorInput = (props: PaletteFieldColorProps) => {
	const [color, setColor] = useSyncedState(props.color.toCSS(Color.Format.HEX) as string);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback((e) => {
		const colorHex = e.target.value;
		setColor(colorHex);

		let color: Color;
		try {
			color = Color.fromHex(colorHex);
		} catch (_) {}
		if (!color) {
			return;
		}

		props.palette.data.setColor(props.set, props.index, color);

		props.paletteManager.save();

		if (props.paletteManager.isActive(props.palette)) {
			props.paletteManager.applyActive();
		}
	}, [props.palette, props.index, props.set]);

	return (
		<div className="color-set__color-input flex items-center bg-[var(--color-input-bg)] rounded-[var(--border-radius)] h-8 w-28">
			<input
				className="color-input__picker bg-transparent border-none h-8 w-8 p-2 cursor-pointer"
				type="color"
				value={color}
				onChange={onChange}
			/>
			<input
				className="color-input__text bg-transparent border-none w-20 p-2"
				type="text"
				value={color}
				onChange={onChange}
			/>
		</div>
	);
};
