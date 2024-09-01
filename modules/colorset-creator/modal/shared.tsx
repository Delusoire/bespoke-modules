import { Palette, PaletteManager } from "../src/palette.ts";
import { createIconComponent } from "/modules/stdlib/lib/createIconComponent.tsx";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { Menu, MenuItem, RightClickMenu } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { classnames } from "/modules/stdlib/src/webpack/ClassNames.ts";
import { Schemer } from "../src/schemer.ts";
import { MenuItemSubMenu } from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { CHECK_ICON_PATH } from "../static.ts";
import { Entity, EntityContext } from "../src/entity.ts";
import { Configlet, ConfigletManager } from "../src/configlet.ts";

export const useSyncedState = <S,>(externalState: S) => {
	const externalStateRef = React.useRef(externalState);
	const [internalState, setInternalState] = React.useState(externalStateRef.current);

	const state = externalStateRef.current !== externalState ? externalState : internalState;
	externalStateRef.current = externalState;

	return [state, setInternalState] as const;
};

export const SchemerContextModuleMenuItem = <E extends Entity<any, any>>(
	{ entity, schemer, entities }: {
		entity: E;
		schemer: Schemer;
		entities: Map<string, E>;
	},
) => {
	if (entities.size === 0) {
		return;
	}

	return (
		<MenuItemSubMenu
			displayText={schemer.getModuleIdentifier()}
			depth={1}
			placement="right-start"
		>
			{Object.entries(entities).map(([id, option]) => {
				const context = new Palette.Context(schemer.getModuleIdentifier(), id);
				const isSelected = entity.context && context.equals(entity.context);

				return (
					<SchemerContextIdMenuItem
						key={id}
						entity={option}
						isSelected={isSelected || false}
						context={context}
					/>
				);
			})}
		</MenuItemSubMenu>
	);
};

export const SchemerContextIdMenuItem = (
	{ entity, context, isSelected }: { entity: Entity<any, any>; context: EntityContext; isSelected: boolean },
) => {
	const onClick = React.useCallback(() => {
		entity.context = context;
	}, [entity]);

	return (
		<MenuItem
			trailingIcon={isSelected && createIconComponent({ icon: CHECK_ICON_PATH })}
			onClick={onClick}
		>
			{entity.name}
		</MenuItem>
	);
};

export interface SchemerContextMenuProps {
	isSelected: boolean;
	entity: Palette | Configlet;
	selectEntity: (entity: Palette | Configlet) => void;
}
export const SchemerContextMenu = ({ entity, isSelected, selectEntity }: SchemerContextMenuProps) => {
	const onSelect = React.useCallback(() => {
		selectEntity(entity);
	}, [entity]);

	const resetContext = React.useCallback(() => {
		entity.context = null;
	}, [entity]);

	const menu = (
		<Menu>
			<MenuItem onClick={resetContext} divider="after" disabled={entity.context == null}>
				Reset context
			</MenuItem>
			{Schemer.instances().map((schemer) => (
				<SchemerContextModuleMenuItem
					key={schemer.getModuleIdentifier()}
					schemer={schemer}
					entities={schemer.getPalettes()}
					entity={entity}
				/>
			))}
		</Menu>
	);

	return (
		<RightClickMenu menu={menu}>
			<MenuItem
				trailingIcon={isSelected && createIconComponent({ icon: CHECK_ICON_PATH })}
				onClick={onSelect}
			>
				{entity.name}
			</MenuItem>
		</RightClickMenu>
	);
};

export type InfoButtonProps = JSX.IntrinsicElements["button"];
export const InfoButton = (props: InfoButtonProps) => {
	const className = classnames(
		"info__button",
		"bg-white border-none h-8 rounded-[var(--border-radius)] px-3 text-black text-sm cursor-pointer",
		props.className,
	);
	return <button {...props} className={className}>{props.children}</button>;
};

export interface EntityInfoProps<E extends typeof PaletteManager | typeof ConfigletManager> {
	entity: InstanceType<E["Entity"]>;
	entitiesUpdated: () => void;
	enitityManager: InstanceType<E>;
}

export const EntityInfo = <E extends typeof PaletteManager | typeof ConfigletManager>(
	{ entity, entitiesUpdated, enitityManager }: EntityInfoProps<E>,
) => {
	const [name, setName] = useSyncedState(entity.name);

	const deleteEntity = React.useCallback(() => {
		enitityManager.delete(entity);
		entitiesUpdated();
	}, [entity]);

	const resetEntity = React.useCallback(() => {
		entity.reset();
		entitiesUpdated();
	}, [entity]);

	const renameEntity = React.useCallback((name: string) => {
		enitityManager.rename(entity, name);
		entitiesUpdated();
	}, [name, entity]);

	// const copySerializedEntity = React.useCallback(async () => {
	// 	const serializedEntity = JSON.stringify(entity);
	// 	await Platform.getClipboardAPI().copy(serializedEntity);
	// }, [palette]);

	const copyEntity = React.useCallback(() => {
		const entityCtor = entity.constructor as E["Entity"];
		const copy = entityCtor.create(name, entity.data.copy(), entity.context);
		enitityManager.add(copy);
		entitiesUpdated();
	}, [name, entity.data, entity.context]);

	return (
		<div className="palette__info flex gap-[var(--gap-primary)]">
			<input
				className="palette__name bg-[var(--input-bg)] p-2 border-none rounded-[var(--border-radius)] h-8 flex-grow text-base text-white"
				placeholder="Custom Palette"
				value={name}
				onChange={(e) => {
					const name = e.target.value;
					setName(name);
					renameEntity(name);
				}}
			/>
			<InfoButton
				type="button"
				key="rename"
				onClick={resetEntity}
			>
				Reset
			</InfoButton>
			<InfoButton
				type="button"
				key="delete"
				onClick={deleteEntity}
			>
				Delete
			</InfoButton>
			<InfoButton
				type="button"
				onClick={copyEntity}
			>
				Copy
			</InfoButton>
		</div>
	);
};
