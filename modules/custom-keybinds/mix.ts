import type { React } from "/modules/stdlib/src/expose/React.ts";
import type { Transformer } from "/hooks/index.ts";

type Identity<T> = (x: T) => T;

export type Shortcut = { action: string; description: string; enabled: boolean };

declare global {
	var __patchKeybindSectionComponent: Identity<React.FC<{ shortcuts: Shortcut[]; sectionTitle: string }>>;
}

globalThis.__patchKeybindSectionComponent = (x) => x;

export default async function (transformer: Transformer) {
	transformer((emit) => (str) => {
		str = str.replaceAll(
			/\(0,([a-zA-Z_\$][\w\$]*)\.jsx\)\(([a-zA-Z_\$][\w\$]*),{(shortcuts:[^,]+,sectionTitle:[^,]+)}\)/g,
			"(0,$1.jsx)(__patchKeybindSectionComponent($2),{$3})",
		);
		emit();
		return str;
	}, {
		glob: /^\/xpui-root-dialogs\.js$/,
	});
}
