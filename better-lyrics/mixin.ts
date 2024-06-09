import { Transformer } from "/hooks/transform.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";

declare global {
	var __renderCinemaLyrics: React.FC<void>;
}

globalThis.__renderCinemaLyrics = () => undefined;

export default function (transformer: Transformer) {
	transformer((emit) => (str) => {
		str = str.replace(
			/(className:[a-zA-Z_\$][\w\$]*\.Content,children:\(0,[a-zA-Z_\$][\w\$]*\.jsxs?\))\([^\)]*\)(?=[^;]*"No container found for cinema video!")/,
			"$1(__renderCinemaLyrics, {})",
		);

		emit();

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
