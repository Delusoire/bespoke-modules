import { Transformer } from "/hooks/transform.ts";

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

		str = str.replace(
			/([a-zA-Z_\$][\w\$]*)\.hasLyrics\)return null;/,
			'$1.hasLyrics){$1??={};$1.hasLyrics=true;$1.colors??={activeText:"rgb(255, 255, 255)",background:"rgb(100, 100, 100)",text:"rgb(0, 0, 0)"};}',
		);

		emit();

		return str;
	}, {
		glob: /^\/xpui\.js$/,
	});
}
