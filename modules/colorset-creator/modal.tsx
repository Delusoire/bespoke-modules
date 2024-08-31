import { useSearchBar } from "/modules/stdlib/lib/components/index.tsx";
import { Palette, PaletteContext, PaletteManager } from "./palette.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { startCase } from "/modules/stdlib/deps.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { Menu, MenuItem, RightClickMenu } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { ChangeEvent } from "npm:@types/react";
import { Color } from "/modules/stdlib/src/webpack/misc.ts";
import { ColorSets } from "./webpack.ts";
import { classnames } from "/modules/stdlib/src/webpack/ClassNames.ts";
import { Schemer } from "./schemer.ts";
import { MenuItemSubMenu } from "/modules/stdlib/src/webpack/ReactComponents.ts";

const CHECK_ICON_PATH =
	'<path d="M15.53 2.47a.75.75 0 0 1 0 1.06L4.907 14.153.47 9.716a.75.75 0 0 1 1.06-1.06l3.377 3.376L14.47 2.47a.75.75 0 0 1 1.06 0z"/>';

export default function () {
	const setCurrentPalette = (_: Palette | null, palette: Palette | null) =>
		PaletteManager.INSTANCE.setCurrent(palette);
	const getCurrentPalette = (_: null) => PaletteManager.INSTANCE.getCurrent();

	const [selectedPalette, selectPalette] = React.useReducer(
		setCurrentPalette,
		null as never,
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

	const newPalette = React.useCallback(() => {
		PaletteManager.INSTANCE.addPalette(Palette.createDefault());

		updatePalettes();
	}, []);

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
							onClick={newPalette}
						>
							Create New Palette
						</MenuItem>
					</div>
					<ul className="palette-modal__list overflow-y-auto">
						{filteredPalettes.map((palette) => (
							<PaletteListItem
								key={palette.id}
								palette={palette}
								isSelected={palette === selectedPalette}
								selectPalette={selectPalette}
							/>
						))}
					</ul>
				</ul>
			</div>
			{selectedPalette &&
				(
					<PaletteComponent
						palette={selectedPalette}
						updatePalettes={updatePalettes}
						selectPalette={selectPalette}
					/>
				)}
		</div>
	);
}

const SchemerMenuItemA = (
	{ palette, schemer }: { palette: Palette; schemer: Schemer },
) => {
	const palettes = schemer.getPalettes();

	if (palettes.size === 0) {
		return;
	}

	return (
		<MenuItemSubMenu
			displayText={schemer.getModuleIdentifier()}
			depth={1}
			placement="right-start"
		>
			{Object.entries(palettes).map(([id, option]) => {
				const context = new PaletteContext(schemer.getModuleIdentifier(), id);
				const isSelected = palette.context && context.equals(palette.context);

				return (
					<SchemerMenuItemB
						key={id}
						palette={option}
						isSelected={isSelected || false}
						context={context}
					/>
				);
			})}
		</MenuItemSubMenu>
	);
};

const SchemerMenuItemB = (
	{ palette, context, isSelected }: { palette: Palette; context: PaletteContext; isSelected: boolean },
) => {
	const onClick = React.useCallback(() => {
		palette.context = context;
	}, [palette]);

	return (
		<MenuItem
			trailingIcon={isSelected && createIconComponent({ icon: CHECK_ICON_PATH })}
			onClick={onClick}
		>
			{palette.name}
		</MenuItem>
	);
};

interface PaletteListItemProps {
	isSelected: boolean;
	palette: Palette;
	selectPalette: (palette: Palette | null) => void;
}
const PaletteListItem = ({ palette, isSelected, selectPalette }: PaletteListItemProps) => {
	const onSelect = React.useCallback(() => {
		selectPalette(isSelected ? null : palette);
	}, [palette, isSelected]);

	const resetContext = React.useCallback(() => {
		palette.context = null;
	}, [palette]);

	const menu = (
		<Menu>
			<MenuItem onClick={resetContext} divider="after" disabled={palette.context == null}>
				Reset context
			</MenuItem>
			{Schemer.instances().map((schemer) => (
				<SchemerMenuItemA key={schemer.getModuleIdentifier()} schemer={schemer} palette={palette} />
			))}
		</Menu>
	);

	return (
		<RightClickMenu menu={menu}>
			<MenuItem
				trailingIcon={isSelected && createIconComponent({ icon: CHECK_ICON_PATH })}
				onClick={onSelect}
			>
				{palette.name}
			</MenuItem>
		</RightClickMenu>
	);
};

interface PaletteFieldsProps {
	palette: Palette;
	updatePalettes: () => void;
	selectPalette: (palette: Palette | null) => void;
}
const PaletteComponent = (props: PaletteFieldsProps) => {
	return (
		<div className="palette-modal__palette flex-grow h-[45vh] gap-[var(--gap-primary)] flex flex-col text-sm bg-neutral-900 rounded-[var(--border-radius)]">
			<PaletteInfo
				palette={props.palette}
				updatePalettes={props.updatePalettes}
				selectPalette={props.selectPalette}
			/>
			<div className="palette__color-sets bg-[var(--secondary-bg)] p-[var(--gap-primary)] rounded-[var(--border-radius)] flex flex-col flex-nowrap overflow-y-auto h-[calc(100%-40px)] gap-y-1 gap-x-[var(--gap-secondary)]">
				{Object.entries(props.palette.theme.getColors()).map(([set, colors]) => (
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
	selectPalette: (palette: Palette | null) => void;
}

const PaletteInfo = ({ palette, updatePalettes, selectPalette }: PaletteInfoProps) => {
	const [name, setName] = React.useState(palette.name);
	const updateName = useUpdater(setName)(palette.name);

	const deletePalette = React.useCallback(() => {
		PaletteManager.INSTANCE.deletePalette(palette);
		selectPalette(null);
		updatePalettes();
	}, [palette]);

	const renamePalette = React.useCallback(() => {
		PaletteManager.INSTANCE.renamePalette(palette, name);
		updatePalettes();
	}, [name, palette]);

	// const copySerializedPalette = React.useCallback(async () => {
	// 	const serializedPalette = JSON.stringify(palette);
	// 	await Platform.getClipboardAPI().copy(serializedPalette);
	// }, [palette]);

	const copyPalette = React.useCallback(() => {
		const copy = Palette.create(name, palette.theme.copy(), palette.context);
		PaletteManager.INSTANCE.addPalette(copy);
		selectPalette(copy);
		updatePalettes();
	}, [name, palette.theme, palette.context]);

	return (
		<div className="palette__info flex gap-[var(--gap-primary)]">
			<input
				className="palette__name bg-[var(--input-bg)] p-2 border-none rounded-[var(--border-radius)] h-8 flex-grow text-base text-white"
				placeholder="Custom Palette"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<PaletteInfoButton
				type="button"
				key="delete"
				onClick={deletePalette}
			>
				Delete
			</PaletteInfoButton>
			<PaletteInfoButton
				type="button"
				key="rename"
				onClick={renamePalette}
			>
				Rename
			</PaletteInfoButton>
			<PaletteInfoButton
				type="button"
				onClick={copyPalette}
			>
				Copy
			</PaletteInfoButton>
		</div>
	);
};

type PaletteInfoButtonProps = JSX.IntrinsicElements["button"];
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

		props.palette.theme.setColor(props.set, props.index, color);

		PaletteManager.INSTANCE.save();

		if (PaletteManager.INSTANCE.isCurrent(props.palette)) {
			PaletteManager.INSTANCE.applyCurrent();
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
