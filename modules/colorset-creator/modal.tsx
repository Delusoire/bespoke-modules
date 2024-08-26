/* Copyright (C) 2024 harbassan, and Delusoire
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSearchBar } from "/modules/stdlib/lib/components/index.tsx";
import { Palette, PaletteManager } from "./palette.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { startCase } from "/modules/stdlib/deps.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { MenuItem } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { ChangeEvent } from "npm:@types/react";
import { Color } from "/modules/stdlib/src/webpack/misc.ts";
import { ColorSets } from "./webpack.ts";
import { classnames } from "../stdlib/src/webpack/ClassNames.ts";

export default function () {
	const setCurrentPalette = (_: Palette, palette: Palette) => PaletteManager.INSTANCE.setCurrent(palette);
	const getCurrentPalette = (_: undefined) => PaletteManager.INSTANCE.getCurrent();

	const [selectedPalette, selectPalette] = React.useReducer(
		setCurrentPalette,
		undefined,
		getCurrentPalette,
	);

	const getPalettes = () => PaletteManager.INSTANCE.getPalettes();

	const [palettes, updatePalettes] = React.useReducer(
		getPalettes,
		undefined,
		getPalettes,
	);
	const [searchbar, search] = useSearchBar({
		placeholder: "Search Palettes",
		expanded: true,
	});

	function createPalette() {
		PaletteManager.INSTANCE.addUserPalette(
			new Palette(crypto.randomUUID(), "New Palette", selectedPalette.colors, false),
		);

		updatePalettes();
	}

	const filteredPalettes = palettes.filter((palette) =>
		palette.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="palette-modal flex gap-[var(--gap-primary)]">
			<div className="palette-modal__sidebar w-48 bg-neutral-900">
				<ul className="flex flex-col">
					{searchbar}
					<div className="palette-modal__new-palette-btn mt-1">
						<MenuItem
							leadingIcon={createIconComponent({
								icon: '<path d="M14 7H9V2H7v5H2v2h5v5h2V9h5z"/><path fill="none" d="M0 0h16v16H0z"/>',
							})}
							divider="after"
							onClick={createPalette}
						>
							Create New Palette
						</MenuItem>
					</div>
					<ul className="palette-modal__list overflow-y-auto">
						{filteredPalettes.map((palette) => (
							<MenuItem
								key={palette.id}
								trailingIcon={palette === selectedPalette &&
									createIconComponent({
										icon:
											'<path d="M15.53 2.47a.75.75 0 0 1 0 1.06L4.907 14.153.47 9.716a.75.75 0 0 1 1.06-1.06l3.377 3.376L14.47 2.47a.75.75 0 0 1 1.06 0z"/>',
									})}
								onClick={() => selectPalette(palette)}
							>
								{palette.name}
							</MenuItem>
						))}
					</ul>
				</ul>
			</div>
			<PaletteComponent
				palette={selectedPalette}
				updatePalettes={updatePalettes}
			/>
		</div>
	);
}

interface PaletteFieldsProps {
	palette: Palette;
	updatePalettes: () => void;
}
const PaletteComponent = (props: PaletteFieldsProps) => {
	return (
		<div className="palette-modal__palette flex-grow h-[45vh] gap-[var(--gap-primary)] flex flex-col text-sm bg-neutral-900 rounded-[var(--border-radius)]">
			<PaletteInfo
				palette={props.palette}
				updatePalettes={props.updatePalettes}
			/>
			<div className="palette__color-sets bg-[var(--secondary-bg)] p-[var(--gap-primary)] rounded-[var(--border-radius)] flex flex-col flex-nowrap overflow-y-auto h-[calc(100%-40px)] gap-y-1 gap-x-[var(--gap-secondary)]">
				{Object.entries(props.palette.colors).map(([set, colors]) => (
					<PaletteColorSet
						key={set}
						set={set as ColorSets}
						colors={colors}
						palette={props.palette}
					/>
				))}
			</div>
		</div>
	);
};

interface PaletteInfoProps {
	palette: Palette;
	updatePalettes: () => void;
}

const PaletteInfo = (props: PaletteInfoProps) => {
	const [name, setName] = React.useState(props.palette.name);
	const updateName = useUpdater(setName)(props.palette.name);

	function deletePalette(palette: Palette) {
		PaletteManager.INSTANCE.deleteUserPalette(palette);
		props.updatePalettes();
	}

	function renamePalette(palette: Palette, name: string) {
		PaletteManager.INSTANCE.renameUserPalette(palette, name);
		props.updatePalettes();
	}

	return (
		<div className="palette__info flex gap-[var(--gap-primary)]">
			<input
				className="palette__name bg-[var(--input-bg)] p-2 border-none rounded-[var(--border-radius)] h-8 flex-grow text-base text-white"
				readOnly={props.palette.isStatic}
				placeholder="Custom Palette"
				value={props.palette.isStatic ? name + " (static)" : name}
				onChange={(e) => setName(e.target.value)}
			/>
			{!props.palette.isStatic && [
				<PaletteInfoButton
					type="button"
					key="delete"
					onClick={() => deletePalette(props.palette)}
				>
					Delete
				</PaletteInfoButton>,
				<PaletteInfoButton
					type="button"
					key="rename"
					onClick={() => renamePalette(props.palette, name)}
				>
					Rename
				</PaletteInfoButton>,
			]}
			<PaletteInfoButton
				type="button"
				onClick={() => {
					const css = JSON.stringify(props.palette);
					Platform.getClipboardAPI().copy(css);
				}}
			>
				Copy Object
			</PaletteInfoButton>
		</div>
	);
};

type PaletteInfoButtonProps =
	& React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
	& { children: React.ReactNode };
const PaletteInfoButton = (props: PaletteInfoButtonProps) => {
	const className = classnames(
		"info__button",
		"bg-white border-none h-8 rounded-[var(--border-radius)] px-3 text-black text-sm cursor-pointer",
		props.className,
	);
	return <button {...props} className={className}>{props.children}</button>;
};

interface PaletteFieldProps {
	set: ColorSets;
	colors: Color[];
	palette: Palette;
}
const PaletteColorSet = (props: PaletteFieldProps) => {
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

interface PaletteFieldColorProps {
	set: ColorSets;
	color: Color;
	palette: Palette;
	index: number;
}
const PaletteColorInput = (props: PaletteFieldColorProps) => {
	const colorHex = props.color.toCSS(Color.Format.HEX) as string;

	const [color, setColor] = React.useState(colorHex);
	const updateColor = useUpdater(setColor)(colorHex);

	const onChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const colorHex = e.target.value;
		setColor(colorHex);

		let color: Color;
		try {
			color = Color.fromHex(colorHex);
		} catch (_) {}
		if (!color) {
			return;
		}

		const colors = {
			...props.palette.colors,
			[props.set]: props.palette.colors[props.set].toSpliced(props.index, 1, color),
		};

		if (props.palette.overwrite(colors)) {
			PaletteManager.INSTANCE.save();
		}

		if (PaletteManager.INSTANCE.isCurrent(props.palette)) {
			PaletteManager.INSTANCE.writeCurrent();
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

export const useUpdater =
	<S,>(dispatch: React.Dispatch<React.SetStateAction<S>>) => (updater: React.SetStateAction<S>) => {
		const updateState = React.useCallback(() => dispatch(updater), [updater]);
		React.useEffect(updateState, [updater]);
		return updateState;
	};
