import { useSearchBar } from "/modules/stdlib/lib/components/index.tsx";
import { Palette, PaletteManager, Theme } from "../src/palette.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { startCase } from "/modules/stdlib/deps.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { Menu, MenuItem, RightClickMenu } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { Color } from "/modules/stdlib/src/webpack/misc.ts";
import { ColorSets } from "../src/webpack.ts";
import { classnames } from "/modules/stdlib/src/webpack/ClassNames.ts";
import { Schemer } from "../src/schemer.ts";
import { MenuItemSubMenu } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { CHECK_ICON_PATH } from "../static.ts";
import {
	EntityInfo,
	InfoButton,
	SchemerContextMenu,
	SchemerContextModuleMenuItem,
	useUpdater,
} from "./shared.tsx";
import { Entity, EntityContext } from "../src/entity.ts";

export interface PaletteColorSetsProps {
	palette: Palette;
}
export const PaletteColorSets = ({ palette }: PaletteColorSetsProps) => {
	return (
		<div className="palette__color-sets bg-[var(--secondary-bg)] p-[var(--gap-primary)] rounded-[var(--border-radius)] flex flex-col flex-nowrap overflow-y-auto h-[calc(100%-40px)] gap-y-1 gap-x-[var(--gap-secondary)]">
			{Object.entries(palette.data.getColors()).map(([set, colors]) => (
				<PaletteColorSet
					key={set}
					set={set as ColorSets}
					colors={colors}
					palette={palette}
				/>
			))}
		</div>
	);
};

export interface PaletteFieldProps {
	set: ColorSets;
	colors: Color[];
	palette: Palette;
}
export const PaletteColorSet = (props: PaletteFieldProps) => {
	return (
		<div className="palette__color-set flex items-center justify-between">
			<label>{startCase(props.set)}</label>
			<div className="color-set__color-inputs flex gap-[var(--gap-primary)] items-center">
				{props.colors.map((c, i) => (
					<PaletteColorInput color={c} palette={props.palette} set={props.set} key={i} index={i} />
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
}
export const PaletteColorInput = (props: PaletteFieldColorProps) => {
	const colorHex = props.color.toCSS(Color.Format.HEX) as string;

	const [color, setColor] = React.useState(colorHex);
	const updateColor = useUpdater(setColor)(colorHex);

	const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

		PaletteManager.INSTANCE.save();

		if (PaletteManager.INSTANCE.isActive(props.palette)) {
			PaletteManager.INSTANCE.applyActive();
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
