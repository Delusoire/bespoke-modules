import { useSearchBar } from "/modules/stdlib/lib/components/index.tsx";
import { Palette, PaletteManager } from "../src/palette.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { MenuItem } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { EntityInfo, SchemerContextMenu } from "./shared.tsx";
import { Configlet, ConfigletManager } from "../src/configlet.ts";
import { PaletteColorSets } from "./palette.tsx";
import { ConfigletSlateDocument } from "./configlet.tsx";

const useNext = <T,>(options: T[]) => {
	const [active, setActive] = React.useState(0);
	const next = React.useCallback(() => setActive((active) => (active + 1) % options.length), [options.length]);
	return [options[active], next] as const;
};

export default function ModalContent() {
	const [entityManager, nextEntityManager] = useNext([PaletteManager.INSTANCE, ConfigletManager.INSTANCE]);

	const toggleEntity = React.useCallback((entity: Palette | Configlet) => {
		entityManager.toggleActive(entity, entityManager instanceof PaletteManager);
	}, [entityManager]);

	const getEntities = React.useCallback(() => entityManager.getAll(), [entityManager]);
	const getDefaultEntity = React.useCallback(() => {
		const allActive = entityManager.getAllActive();
		if (allActive.length) {
			return allActive[0];
		}
		const all = entityManager.getAll();
		if (all.length) {
			return all[0];
		}
		return null;
	}, [entityManager]);

	const [entities, updateEntities] = React.useReducer(getEntities, undefined, getEntities);
	const [_selectedEntity, selectEntity] = React.useState(getDefaultEntity);
	const selectedEntity = !entities.includes(_selectedEntity) ? _selectedEntity : getDefaultEntity();

	return (
		<div className="palette-manager-modal flex gap-[var(--gap-primary)]">
			<ModalSidebar
				entities={entities}
				updatePalettes={updateEntities}
				selectedEntity={selectedEntity}
				selectEntity={selectEntity}
				entityManager={entityManager}
				nextEntityManager={nextEntityManager}
			/>
			{selectedEntity &&
				(
					<EntityComponent
						entity={selectedEntity}
						entitiesUpdated={updateEntities}
						enitityManager={entityManager}
					/>
				)}
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
	nextEntityManager: () => void;
}
const ModalSidebar = <E extends typeof PaletteManager | typeof ConfigletManager>(
	{ entities, updatePalettes, selectedEntity, selectEntity, entityManager, nextEntityManager }:
		ModalSidebarProps<E>,
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
		<div className="palette-manager-modal__sidebar w-48 bg-neutral-900">
			<ul className="flex flex-col">
				<div>
					<button onClick={nextEntityManager}>TODO: TOGGLE</button>
				</div>
				{searchbar}
				<div className="palette-manager-modal__btn-new mt-1">
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
				<ul className="palette-manager-modal__entity-list overflow-y-auto">
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
		<div className="palette-manager-modal__entity flex-grow h-[45vh] gap-[var(--gap-primary)] flex flex-col text-sm bg-neutral-900 rounded-[var(--border-radius)]">
			<EntityInfo
				entity={entity}
				entitiesUpdated={entitiesUpdated}
				enitityManager={enitityManager}
			/>
			{enitityManager instanceof PaletteManager && (
				<PaletteColorSets palette={entity as Palette} paletteManager={enitityManager} />
			)}
			{enitityManager instanceof ConfigletManager && (
				<ConfigletSlateDocument configlet={entity as Configlet} configletManager={enitityManager} />
			)}
		</div>
	);
};
