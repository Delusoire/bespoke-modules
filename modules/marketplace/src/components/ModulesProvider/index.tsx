import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { _ } from "/modules/official/stdlib/deps.ts";
import { Module, ModuleIdentifier, RootModule } from "/hooks/module.ts";
import { LocalModule, RemoteModule } from "/hooks/module.ts";
import { MI } from "/modules/Delusoire/marketplace/src/pages/Marketplace.tsx";

const getModulesByIdentifier = () => {
   const modules = RootModule.INSTANCE.getAllDescendantsByBreadth();
   const modulesByIdentifier = Object.groupBy(modules, (module) => module.getIdentifier());
   return modulesByIdentifier as Record<ModuleIdentifier, Array<LocalModule | RemoteModule>>;
};

const getModuleToInst = (modules: Record<ModuleIdentifier, Array<Module<Module<any>>>>) =>
   Object.fromEntries(
      Object.entries(modules).flatMap(([identifier, modules]) => {
         let selected: MI | null = null;

         for (const module of modules) {
            const version = module.getEnabledVersion() || module.instances.keys().next().value;
            if (version) {
               selected = module.instances.get(version) as MI;
               break;
            }
         }

         return selected ? [[identifier, selected]] : [];
      }),
   );

const _useModules = () => {
   const [, rerender] = React.useReducer((n) => n + 1, 0);

   const [modules, setModules] = React.useState(getModulesByIdentifier);

   const updateModules = React.useCallback(() => setModules(getModulesByIdentifier), [setModules]);

   const setModulesForIdentifier = React.useCallback(
      (
         identifier: ModuleIdentifier,
         f: (_modules: Array<LocalModule | RemoteModule>) => Array<LocalModule | RemoteModule>,
      ) => {
         setModules((modules) => {
            modules[identifier] = Array.from(f(modules[identifier] ?? []));
            return modules;
         });
         rerender();
      },
      [setModules],
   );

   const addModule = React.useCallback((module: LocalModule | RemoteModule) => {
      setModulesForIdentifier(module.getIdentifier(), (modules) => {
         const i = modules.indexOf(module);
         if (!~i) {
            modules.unshift(module);
         }
         return modules;
      });
   }, [setModulesForIdentifier]);

   const removeModule = React.useCallback((module: LocalModule | RemoteModule) => {
      setModulesForIdentifier(module.getIdentifier(), (modules) => {
         const i = modules.indexOf(module);
         if (~i) {
            modules.splice(i, 1);
         }
         return modules;
      });
   }, [setModulesForIdentifier]);

   const updateModule = React.useCallback((module: LocalModule | RemoteModule) => {
      setModulesForIdentifier(module.getIdentifier(), (modules) => modules);
   }, [setModulesForIdentifier]);

   const [moduleToInstance, selectInstance] = React.useReducer(
      (moduleToInst: Record<ModuleIdentifier, MI>, moduleInstance: MI) => ({
         ...moduleToInst,
         [moduleInstance.getModuleIdentifier()]: moduleInstance,
      }),
      modules,
      getModuleToInst,
   );

   const [selectedModule, selectModule] = React.useState<ModuleIdentifier | null>(null);

   return {
      modules,
      setModules,
      updateModules,
      addModule,
      removeModule,
      updateModule,
      moduleToInstance,
      selectInstance,
      selectedModule,
      selectModule,
   };
};

export const ModulesContext = React.createContext<ReturnType<typeof _useModules> | null>(null);
export const ModulesContextProvider = ({ children }: { children: React.ReactNode }) => {
   const value = _useModules();
   return <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>;
};

export const useModules = () => {
   const context = React.useContext(ModulesContext);
   if (!context) {
      throw new Error("useModules must be used within a ModulesContextProvider");
   }
   return context;
};
