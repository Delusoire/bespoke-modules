import { useSearchBar } from "/modules/stdlib/lib/components/index.tsx";
import { Palette, PaletteManager } from "../src/palette.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { MenuItem } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { EntityInfo, SchemerContextMenu } from "./shared.tsx";
import { Configlet, ConfigletManager } from "../src/configlet.ts";
import { PaletteColorSets } from "./palette.tsx";
import { ConfigletSlateDocument } from "./configlet.tsx";
import { useDynamicReducer, useNext } from "./hooks.ts";

export default function ModalContent() {
	const [entityManager, _nextEntityManager] = useNext([PaletteManager.INSTANCE, ConfigletManager.INSTANCE]);

	const getEntities = React.useCallback(() => entityManager.getAll(), [entityManager]);

	const [entities, updateEntities] = useDynamicReducer(getEntities, undefined, getEntities);

	const nextEntityManager = React.useCallback(() => {
		_nextEntityManager();
		updateEntities();
	}, []);

	const activeEntities = entityManager.getAllActive();
	const getDefaultEntity = React.useCallback(() => {
		if (activeEntities.length) {
			return activeEntities[0];
		}
		return entityManager.getAll()[0] ?? null;
	}, [activeEntities, entityManager]);

	const [_selectedEntity, selectEntity] = React.useState(getDefaultEntity);
	const selectedEntity = entities.includes(_selectedEntity) ? _selectedEntity : getDefaultEntity();

	return (
		<div className="palette-manager-modal flex gap-[var(--sidebar-gap)] h-[66vh]">
			<div className="w-[var(--sidebar-width)]">
				<ModalSidebar
					activeEntities={activeEntities}
					entities={entities}
					updatePalettes={updateEntities}
					selectedEntity={selectedEntity}
					selectEntity={selectEntity}
					entityManager={entityManager}
					nextEntityManager={nextEntityManager}
				/>
			</div>
			<div className="flex-grow min-w-0">
				{selectedEntity &&
					(
						<EntityComponent
							entity={selectedEntity}
							entitiesUpdated={updateEntities}
							enitityManager={entityManager}
						/>
					)}
			</div>
		</div>
	);
}

interface EntityTypeSelectorProps {
	entityManager: InstanceType<typeof PaletteManager | typeof ConfigletManager>;
	nextEntityManager: () => void;
}
const EntityTypeSelector = ({ entityManager, nextEntityManager }: EntityTypeSelectorProps) => {
	return (
		<div className="palette-manager-modal__entity-type-selector flex items-center justify-center bg-black rounded-full p-1">
			<button
				className={`px-4 py-2 rounded-full transition-colors duration-200 ${
					entityManager === PaletteManager.INSTANCE
						? "bg-green-500 text-white"
						: "bg-transparent text-gray-500"
				}`}
				onClick={nextEntityManager}
			>
				Palettes
			</button>
			<button
				className={`px-4 py-2 rounded-full transition-colors duration-200 ${
					entityManager === ConfigletManager.INSTANCE
						? "bg-blue-500 text-white"
						: "bg-transparent text-gray-500"
				}`}
				onClick={nextEntityManager}
			>
				Configlets
			</button>
		</div>
	);
};

type ToArray<T> = T extends any ? T[] : never;

interface ModalSidebarProps<E extends typeof PaletteManager | typeof ConfigletManager> {
	activeEntities: ToArray<InstanceType<E["Entity"]>>;
	entities: ToArray<InstanceType<E["Entity"]>>;
	updatePalettes: () => void;
	selectedEntity: InstanceType<E["Entity"]> | null;
	selectEntity: (entity: InstanceType<E["Entity"]>) => void;
	entityManager: InstanceType<E>;
	nextEntityManager: () => void;
}
const ModalSidebar = <E extends typeof PaletteManager | typeof ConfigletManager>(
	{ entities, activeEntities, updatePalettes, selectedEntity, selectEntity, entityManager, nextEntityManager }:
		ModalSidebarProps<E>,
) => {
	const [searchbar, search] = useSearchBar({
		placeholder: "Search",
		expanded: true,
	});

	const newEntity = React.useCallback(() => {
		const entityManagerCtor = entityManager.constructor as E;
		const entityCtor = entityManagerCtor.Entity;
		entityManager.add(entityCtor.createDefault());
		updatePalettes();
	}, [entityManager]);

	const filteredEntities = entities.filter((entity) =>
		entity.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="palette-manager-modal__sidebar bg-neutral-900">
			<ul className="flex flex-col h-full">
				<EntityTypeSelector entityManager={entityManager} nextEntityManager={nextEntityManager} />
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
					{filteredEntities.map((entity) => (
						<SchemerContextMenu
							key={entity.id}
							entity={entity}
							isSelected={entity === selectedEntity}
							isActive={activeEntities.includes(entity)}
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
		<div className="palette-manager-modal__entity gap-[var(--gap-primary)] flex flex-col bg-neutral-900 rounded-[var(--border-radius)] h-full">
			<EntityInfo
				entity={entity}
				entitiesUpdated={entitiesUpdated}
				enitityManager={enitityManager}
			/>
			<div className="min-h-0 overflow-y-auto">
				{enitityManager instanceof PaletteManager && (
					<PaletteColorSets palette={entity as Palette} paletteManager={enitityManager} />
				)}
				{enitityManager instanceof ConfigletManager && (
					<ConfigletSlateDocument configlet={entity as Configlet} configletManager={enitityManager} />
				)}
			</div>
		</div>
	);
};
