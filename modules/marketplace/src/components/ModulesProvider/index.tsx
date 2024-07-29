import { React } from "/modules/stdlib/src/expose/React.ts";
import { _ } from "/modules/stdlib/deps.ts";
import { type Module, type ModuleIdentifier, type ModuleInstance, RootModule } from "/hooks/module.ts";

const getModulesByIdentifier = () => {
	const modules = Array.from(RootModule.INSTANCE.getDescendantsByDepth());
	const modulesByIdentifier = Object.groupBy(
		modules,
		(module) => module.getIdentifier(),
	);
	return modulesByIdentifier as Record<ModuleIdentifier, [Module]>;
};

const getModuleToInst = (modules: Record<ModuleIdentifier, Array<Module>>) =>
	Object.fromEntries(
		Object.entries(modules).flatMap(([identifier, modules]) => {
			let selected: ModuleInstance | null = null;

			for (const module of modules) {
				const version = module.getEnabledVersion() ||
					module.instances.keys().next().value;
				if (version) {
					selected = module.instances.get(version) as ModuleInstance;
					break;
				}
			}

			return selected ? [[identifier, selected]] : [];
		}),
	);

const _useModules = () => {
	const [, rerender] = React.useReducer((n) => n + 1, 0);

	const [modules, setModules] = React.useState(getModulesByIdentifier);

	const updateModules = React.useCallback(
		() => setModules(getModulesByIdentifier),
		[],
	);

	const setModulesForIdentifier = React.useCallback(
		(
			identifier: ModuleIdentifier,
			f: (_modules: [Module]) => [Module],
		) => {
			setModules((modules) => {
				modules[identifier] = Array.from(f(modules[identifier] ?? [])) as [Module];
				return modules;
			});
			rerender();
		},
		[],
	);

	const addModule = React.useCallback((module: Module) => {
		setModulesForIdentifier(module.getIdentifier(), (modules) => {
			const i = modules.indexOf(module);
			if (!~i) {
				modules.unshift(module);
			}
			return modules;
		});
	}, []);

	const removeModule = React.useCallback((module: Module) => {
		setModulesForIdentifier(module.getIdentifier(), (modules) => {
			const i = modules.indexOf(module);
			if (~i) {
				modules.splice(i, 1);
			}
			return modules;
		});
	}, []);

	const updateModule = React.useCallback((module: Module) => {
		setModulesForIdentifier(module.getIdentifier(), (modules) => modules);
	}, []);

	const defaultModuleToInstance = getModuleToInst(modules);
	const moduleToInstanceRef = React.useRef(defaultModuleToInstance);
	const moduleToInstance: Record<ModuleIdentifier, ModuleInstance> = {};
	for (
		const [identifier, moduleInstance] of Object.entries(
			defaultModuleToInstance,
		)
	) {
		moduleToInstance[identifier] = moduleToInstanceRef.current[identifier] ??
			moduleInstance;
	}
	moduleToInstanceRef.current = moduleToInstance;

	const selectInstance = React.useCallback(
		(moduleInstance: ModuleInstance) => {
			moduleToInstanceRef.current = {
				...moduleToInstance,
				[moduleInstance.getModuleIdentifier()]: moduleInstance,
			};
			rerender();
		},
		[moduleToInstance],
	);

	const [selectedModule, selectModule] = React.useState<
		ModuleIdentifier | null
	>(null);

	return {
		modules,
		moduleToInstance,
		selectedModule,

		setModules,
		updateModules,
		addModule,
		removeModule,
		updateModule,
		selectInstance,
		selectModule,
	};
};

export const ModulesContext = React.createContext<
	ReturnType<typeof _useModules> | null
>(null);
export const ModulesContextProvider = (
	{ children }: { children?: React.ReactNode },
) => {
	const value = _useModules();
	return (
		<ModulesContext.Provider value={value}>
			{children}
		</ModulesContext.Provider>
	);
};

export const useModules = () => {
	const context = React.useContext(ModulesContext);
	if (!context) {
		throw new Error(
			"useModules must be used within a ModulesContextProvider",
		);
	}
	return context;
};
