import { Transformer } from "/hooks/transform.ts";

const tboSel = ".T1xI1RTSFU7Wu94UuvE6,.mjZrvVI3CxfHJXu7y0Lg";
const lswSel = ".NXiYChVp4Oydfxd7rT5r,._osiFNXU9Cy1X0CYaU9Z,.BdcvqBAid96FaHAmPYw_";
const pwSel = ".NXiYChVp4Oydfxd7rT5r,._osiFNXU9Cy1X0CYaU9Z,.zL6hQR4mukVUUQaa_7K1,.hjyiWzPtKHn_5kCe9vyg";

declare global {
	var __patchTbo: (prop: string, val: string) => void;
	var __patchLswPw: (prop: string, val: string) => boolean;
}

globalThis.__patchTbo = (prop, val) => {
	document.querySelectorAll(tboSel).forEach((n) => n.style.setProperty(prop, val));
};

const maps: Record<string, WeakMap<HTMLElement, string>> = {};
const setCssVar = (prop: string, val: string) => (node: HTMLElement) => {
	const map = maps[prop] ??= new WeakMap();
	const oldVal = map.get(node);
	if (val !== oldVal) {
		map.set(node, val);
		node.style.setProperty(prop, val);
	}
};

globalThis.__patchLswPw = (prop, val) => {
	switch (prop) {
		case "--left-sidebar-width":
			document.querySelectorAll(lswSel).forEach(setCssVar(prop, val));
			return true;
		case "--panel-width":
			document.querySelectorAll(pwSel).forEach(setCssVar(prop, val));
			return true;
	}
	return false;
};

export default function (transformer: Transformer) {
	transformer((emit) => (str) => {
		emit();

		str = str.replace(
			/&&[a-zA-Z_\$][\w\$]*\.current\.style\.setProperty\(("--top-bar-opacity"),(.+?)\)(?=})/,
			`&&__patchTbo($1,$2)`,
		);

		// str = str.replace(/e!==[a-zA-Z_\$][\w\$]*\.current&&(\(document.documentElement.style.setProperty\(([a-zA-Z_\$][\w\$]*),(.+?)\))(?=,)/, "__patchLswPw($2,$3)||$1");

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
