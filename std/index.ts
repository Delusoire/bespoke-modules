export * from "./static.js";

import { S as _S } from "./expose/index.js";
export const S = _S;

import type { Module } from "/hooks/module.js";

import { Registrar } from "./registers/registers.js";

export const createRegistrar = (mod: Module & { registrar?: Registrar }) => {
	if (!mod.registrar) {
		mod.registrar = new Registrar(mod.getIdentifier());
		const unloadJS = mod.unloadJS;
		mod.unloadJS = () => {
			mod.registrar.dispose();
			return unloadJS();
		};
	}

	return mod.registrar;
};

export const createStorage = <M extends Module>(mod: M & { storage?: Storage }) => {
	if (!mod.storage) {
		const hookedMethods = new Set(["getItem", "setItem", "removeItem"]);

		mod.storage = new Proxy(globalThis.localStorage, {
			get(target, p, receiver) {
				if (typeof p === "string" && hookedMethods.has(p)) {
					return (key: string, ...data: any[]) => target[p](`module:${mod.getIdentifier()}:${key}`, ...data);
				}

				return target[p as keyof typeof target];
			},
		});
	}

	return mod.storage;
};

export const createLogger = (mod: Module & { logger?: Console }) => {
	if (!mod.logger) {
		const hookedMethods = new Set(["debug", "error", "info", "log", "warn"]);

		mod.logger = new Proxy(globalThis.console, {
			get(target, p, receiver) {
				if (typeof p === "string" && hookedMethods.has(p)) {
					return (...data: any[]) => target[p](`[${mod.getIdentifier()}]:`, ...data);
				}

				return target[p as keyof typeof target];
			},
		});
	}

	return mod.logger;
};

class Event<A> {
	callbacks = new Array<(a: A) => void>();
	constructor(private getArg: () => A) {}

	on(callback) {
		callback(this.getArg());
		this.callbacks.push(callback);
	}
	fire() {
		const arg = this.getArg();
		for (const callback of this.callbacks) callback(arg);
	}
}

const PlayerAPI = S.Platform.getPlayerAPI();

const getPlayerState = () => PlayerAPI.getState();

export const Events = {
	Player: {
		update: new Event(getPlayerState),
		songchanged: new Event(getPlayerState),
	},
};

let cachedState = {};
PlayerAPI.getEvents().addListener("update", ({ data: state }) => {
	if (state?.item?.uri !== cachedState?.item?.uri) Events.Player.songchanged.fire();
	if (state?.isPaused !== cachedState?.isPaused) Events.Player.update.fire();
	cachedState = state;
});
