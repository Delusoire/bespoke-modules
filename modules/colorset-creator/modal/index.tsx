import { useSearchBar } from "/modules/stdlib/lib/components/index.tsx";
import { Palette, PaletteManager } from "../src/palette.ts";
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
import { Entity, EntityContext } from "../src/entity.ts";
import { EntityInfo, SchemerContextMenu } from "./shared.tsx";
import { Configlet, ConfigletManager } from "../src/configlet.ts";
import { PaletteColorSets } from "./palette.tsx";

export default function ModalContent() {
	const setCurrentPalette = (_: Palette | null, palette: Palette | null) =>
		PaletteManager.INSTANCE.toggleActive(palette);
	const getCurrentPalette = (_: null) => PaletteManager.INSTANCE.getActive();

	const [selectedPalette, selectPalette] = React.useReducer(setCurrentPalette, null, getCurrentPalette);

	const getPalettes = () => PaletteManager.INSTANCE.getAll();

	const [palettes, updatePalettes] = React.useReducer(getPalettes, undefined, getPalettes);

	return (
		<div className="palette-modal flex gap-[var(--gap-primary)]">
			<ModalSidebar
				entities={entities}
				updatePalettes={updatePalettes}
				selectedEntity={selectedPalette}
				selectEntity={selectPalette}
				entityManager={}
			/>
			<EntityComponent
				palette={selectedPalette}
				updatePalettes={updatePalettes}
				selectEntity={selectPalette}
			/>
		</div>
	);
}

type ToArray<T> = T extends any ? T[] : never;

interface ModalSidebarProps<E extends typeof PaletteManager | typeof ConfigletManager> {
	entities: ToArray<InstanceType<E["Entity"]>>;
	updatePalettes: () => void;
	selectedEntity: InstanceType<E["Entity"]> | null;
	selectEntity: (entity: InstanceType<E["Entity"]>) => void;
	entityManager: InstanceType<E>;
}
const ModalSidebar = <E extends typeof PaletteManager | typeof ConfigletManager>(
	{ entities, updatePalettes, selectedEntity, selectEntity, entityManager }: ModalSidebarProps<E>,
) => {
	const [searchbar, search] = useSearchBar({
		placeholder: "Search Palettes",
		expanded: true,
	});

	const newEntity = React.useCallback(() => {
		const entityManagerCtor = entityManager.constructor as E;
		const entityCtor = entityManagerCtor.Entity;
		entityManager.add(entityCtor.createDefault());
		updatePalettes();
	}, []);

	const filteredPalettes = entities.filter((entity) =>
		entity.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="palette-modal__sidebar w-48 bg-neutral-900">
			<ul className="flex flex-col">
				<div>TODO: TOGGLE</div>
				{searchbar}
				<div className="palette-modal__btn-new mt-1">
					<MenuItem
						leadingIcon={createIconComponent({
							icon: '<path d="M14 7H9V2H7v5H2v2h5v5h2V9h5z"/><path fill="none" d="M0 0h16v16H0z"/>',
						})}
						divider="after"
						onClick={newEntity}
					>
						Create New
					</MenuItem>
				</div>
				<ul className="palette-modal__entity-list overflow-y-auto">
					{filteredPalettes.map((entity) => (
						<SchemerContextMenu
							key={entity.id}
							entity={entity}
							isSelected={entity === selectedEntity}
							selectEntity={selectEntity}
						/>
					))}
				</ul>
			</ul>
		</div>
	);
};

export interface EntityComponentProps<E extends typeof PaletteManager | typeof ConfigletManager> {
	entity: InstanceType<E["Entity"]>;
	entitiesUpdated: () => void;
	enitityManager: InstanceType<E>;
}
export const EntityComponent = <E extends typeof PaletteManager | typeof ConfigletManager>(
	{ entity, entitiesUpdated, enitityManager }: EntityComponentProps<E>,
) => {
	return (
		<div className="palette-modal__entity flex-grow h-[45vh] gap-[var(--gap-primary)] flex flex-col text-sm bg-neutral-900 rounded-[var(--border-radius)]">
			<EntityInfo
				entity={entity}
				entitiesUpdated={entitiesUpdated}
				enitityManager={enitityManager}
			/>
			{enitityManager instanceof PaletteManager &&
				(
					<PaletteColorSets
						palette={entity as Palette}
					/>
				)}
			{enitityManager instanceof ConfigletManager &&
				<div>Configlet</div>}
		</div>
	);
};
