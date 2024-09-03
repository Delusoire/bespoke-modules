import { DarkLightPair, Palette, type PaletteManager } from "../src/palette.ts";
import { startCase } from "/modules/stdlib/deps.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { Color } from "/modules/stdlib/src/webpack/misc.ts";
import { ColorSet, FlatColorScheme, ThemeType } from "../src/webpack.ts";
import { useSyncedState } from "./shared.tsx";
// @deno-types="npm:react-colorful"
import {
	HexAlphaColorPicker,
	HexColorInput,
} from "https://esm.sh/react-colorful?deps=react@18.3.1,react-dom@18.3.1";
import { ContextMenu } from "/modules/stdlib/src/webpack/ReactComponents.xpui.ts";
// import { ColorPicker, useColor } from "https://esm.sh/react-color-palette?deps=react@18.3.1,react-dom@18.3.1";

export interface PaletteColorSetsProps {
	palette: Palette;
	paletteManager: PaletteManager;
}
export const PaletteColorSets = ({ palette, paletteManager }: PaletteColorSetsProps) => {
	const [selectedSet, selectSet] = React.useState<ColorSet>("base");

	const colorThemes = palette.data.getColors();
	const sets = Object.keys(colorThemes) as ColorSet[];

	const selectedScheme = colorThemes[selectedSet];

	return (
		<div className="flex flex-col h-full">
			<div className="flex flex-row overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "thin" }}>
				{sets.map((set) => (
					<button
						key={set}
						className={`${set === selectedSet ? "bg-green-500" : "bg-transparent"} px-2 py-1 rounded-md`}
						onClick={() => selectSet(set)}
					>
						{startCase(set)}
					</button>
				))}
			</div>
			<div className="palette__color-attributes bg-[var(--secondary-bg)] p-[var(--gap-primary)] rounded-[var(--border-radius)] flex-grow min-h-0">
				<div className="flex flex-col flex-nowrap overflow-y-auto gap-y-1 gap-x-[var(--gap-secondary)] h-full">
					{Object.entries(selectedScheme).map(([attribute, colors]) => (
						<PaletteColorAttribute
							set={selectedSet}
							colors={colors}
							attribute={attribute as keyof FlatColorScheme}
							palette={palette}
							paletteManager={paletteManager}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export interface PaletteColorAttributeProps {
	set: ColorSet;
	attribute: keyof FlatColorScheme;
	colors: DarkLightPair<Color>;
	palette: Palette;
	paletteManager: PaletteManager;
}
export const PaletteColorAttribute = (props: PaletteColorAttributeProps) => {
	return (
		<div className="palette__color-attribute flex items-center justify-between">
			<label>{startCase(props.attribute)}</label>
			<div className="color-set__color-inputs flex gap-[var(--gap-primary)] items-center">
				<>
					<PaletteColorInput
						type={"dark"}
						set={props.set}
						attribute={props.attribute}
						color={props.colors.dark}
						palette={props.palette}
						paletteManager={props.paletteManager}
					/>
					<PaletteColorInput
						type={"light"}
						set={props.set}
						attribute={props.attribute}
						color={props.colors.light}
						palette={props.palette}
						paletteManager={props.paletteManager}
					/>
				</>
			</div>
		</div>
	);
};

export interface PaletteColorInputProps {
	type: ThemeType;
	set: ColorSet;
	attribute: keyof FlatColorScheme;
	color: Color;
	palette: Palette;
	paletteManager: PaletteManager;
}
export const PaletteColorInput = (props: PaletteColorInputProps) => {
	const passedColor = props.color.toCSS(Color.Format.HEXA) as string;
	const initialColor = React.useRef(passedColor);
	const [color, setColor] = useSyncedState(passedColor);

	const onChange = React.useCallback((newColor: string) => {
		setColor(newColor);

		let color: Color;
		try {
			color = Color.fromHex(newColor);
		} catch (_) {}
		if (!color) {
			return;
		}

		props.palette.data.setColor(props.type, props.set, props.attribute, color);

		props.paletteManager.save();

		if (props.paletteManager.isActive(props.palette)) {
			props.paletteManager.applyActive();
		}
	}, [props.palette, props.attribute, props.set]);

	return (
		<div className="color-set__color-input flex items-center bg-[var(--color-input-bg)] rounded-[var(--border-radius)] h-8 w-28">
			<ContextMenu
				menu={
					// <ColorPicker color={color} onChange={setColor} />
					<HexAlphaColorPicker color={initialColor.current} onChange={onChange} />
				}
			>
				<input
					className="color-input__picker bg-transparent border-none h-8 w-8 p-2 cursor-pointer"
					type="color"
					value={color.slice(0, -2)}
				/>
			</ContextMenu>

			<input
				className="color-input__text bg-transparent border-none w-20 p-2"
				type="text"
				value={color}
				onChange={(e) => onChange(e.target.value)}
			/>
			{/* <HexColorInput alpha prefixed color={color} onChange={onChange} /> */}
		</div>
	);
};
