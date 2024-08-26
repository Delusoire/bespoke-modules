import { createStorage } from "/modules/stdlib/mod.ts";
import type { Module } from "/hooks/index.ts";
import { exported } from "/modules/stdlib/src/webpack/index.ts";
import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import type { Shortcut } from "./mix.ts";
import { Platform } from "/modules/stdlib/src/expose/Platform.ts";
import { Locale } from "/modules/stdlib/src/webpack/misc.ts";
import withRecord from "./moustrap-extension-record.mjs";
import { Mousetrap } from "/modules/stdlib/src/webpack/Mousetrap.xpui.ts";

let spotifyKeybinds: Record<string, Array<string>> = {};

export let storage: Storage;
export default async function (mod: Module) {
	storage = createStorage(mod);

	spotifyKeybinds = exported.find((obj) => Array.isArray(obj?.OPEN_HELP));

	loadKeybinds();

	withRecord(Mousetrap);

	globalThis.__patchKeybindSectionComponent = () => KeybindSection;

	return () => {
		globalThis.__patchKeybindSectionComponent = (x) => x;
	};
}

function parseKey(key: string) {
	switch (key) {
		case "mod":
			return "macOS" === Platform.operatingSystem ? "⌘" : "Ctrl";
		case "command":
			return "⌘";
		case "alt":
			return "macOS" === Platform.operatingSystem ? "⌥" : "Alt";
		case "shift":
		case "ctrl":
		case "space":
			return key[0].toUpperCase() + key.slice(1);
		case "up":
			return "↑";
		case "right":
			return "→";
		case "down":
			return "↓";
		case "left":
			return "←";
		default:
			return key.toUpperCase();
	}
}

const KeybindKey = ({ children }: { children: string }) => {
	return <UI.Text as="kbd" variant="bodyMedium" className="hykQHtPI6EeFREwqRrOR">{parseKey(children)}
	</UI.Text>;
};

const KeybindCombinations = ({ action }: { action: string }) => {
	const [combinations, setCombinations] = React.useState(spotifyKeybinds[action]);
	const updateCombinations = React.useCallback((combinations: string[]) => {
		spotifyKeybinds[action] = combinations;
		setCombinations(combinations);
		saveKeybinds();
	}, []);

	const [, rerender] = React.useReducer((x) => x + 1, 0);

	const isListening = React.useRef(false);
	const setIsListening = React.useCallback((listening: boolean) => {
		isListening.current = listening;
		rerender();
	}, []);

	const isVisible = React.useRef(true);

	React.useEffect(() => {
		return () => {
			isVisible.current = false;
		};
	}, []);

	const ref = React.useRef<HTMLDivElement>(null);

	const stopEventPropagation = (e: React.KeyboardEvent<HTMLDivElement>) => {
		e.stopPropagation();
	};

	return (
		<div
			ref={ref}
			style={{ pointerEvents: "all", cursor: "pointer" }}
			tabIndex={0}
			onKeyDown={stopEventPropagation}
			onKeyUp={stopEventPropagation}
			onClick={(e) => {
				e.stopPropagation();
				if (isListening.current) {
					setIsListening(false);
					return;
				}
				setIsListening(true);
				Mousetrap(ref.current!).record((combinations) => {
					if (!isListening.current || !isVisible.current) {
						return;
					}
					updateCombinations(combinations);
					setIsListening(false);
				});
			}}
			onBlur={() => {
				setIsListening(false);
			}}
		>
			{isListening.current
				? <UI.Text variant="bodyMedium">{"Listening (click to cancel)"}</UI.Text>
				: combinations.map((combination, i) => {
					const keys = combination.split("+");
					return (
						<React.Fragment key={combination}>
							{keys.map((key) => <KeybindKey key={key}>{key}</KeybindKey>)}
							{i < combinations.length - 1 && (
								<UI.Text variant="bodyMedium">
									{" "}
									{Locale.get("keyboard.shortcuts.or")}
									{" "}
								</UI.Text>
							)}
						</React.Fragment>
					);
				})}
		</div>
	);
};

const KeybindSection = ({ shortcuts, sectionTitle }: { shortcuts: Shortcut[]; sectionTitle: string }) => {
	return (
		<>
			<UI.Text as="h2" className="ARw2f2PkF29n9Ek_eWu3" variant="titleSmall">{sectionTitle}</UI.Text>
			<ul>
				{shortcuts.map((shortcut) => {
					if (!shortcut.enabled) return null;
					return (
						<li className="umavpIt6VOGqirdlUYWs" key={shortcut.action}>
							<UI.Text variant="bodyMedium" className="dYBZmh_ZIyvBZfaoducd">
								{shortcut.description}
							</UI.Text>
							<KeybindCombinations
								action={shortcut.action}
							/>
						</li>
					);
				})}
			</ul>
		</>
	);
};

function saveKeybinds() {
	storage.setItem("keybinds", JSON.stringify(spotifyKeybinds));
}

function loadKeybinds() {
	const savedKeybinds = JSON.parse(storage.getItem("keybinds") ?? "{}");
	Object.assign(spotifyKeybinds, savedKeybinds);
}
