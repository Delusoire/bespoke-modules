/**
 * Copied from prism-react-renderer repo
 * https://github.com/FormidableLabs/prism-react-renderer/blob/master/src/utils/normalizeTokens.js
 */

import Prism from "https://esm.sh/prismjs";

type PrismToken = Prism.Token;
type Token = {
	types: string[];
	content: string;
	empty?: boolean;
};

const newlineRe = /\r\n|\r|\n/;

// Empty lines need to contain a single empty token, denoted with { empty: true }
const normalizeEmptyLines = (line: Token[]) => {
	if (line.length === 1 && line[0].content === "") {
		Object.assign(line[0], { content: "\n", empty: true });
	}
};

const appendTypes = (types: string[], add: string[] | string): string[] => {
	const typesSize = types.length;
	if (typesSize > 0 && types[typesSize - 1] === add) {
		return types;
	}

	return types.concat(add);
};

// Takes an array of Prism's tokens and groups them by line, turning plain
// strings into tokens as well. Tokens can become recursive in some cases,
// which means that their types are concatenated. Plain-string tokens however
// are always of type "plain".
// This is not recursive to avoid exceeding the call-stack limit, since it's unclear
// how nested Prism's tokens can become
export const normalizeTokens = (
	tokens: Array<PrismToken | string>,
): Token[][] => {
	type Frame = {
		types: string[];
		tokenArr: Array<string | Prism.Token>;
		tokenArrIndex: number;
	};
	let nextFrame: Frame | undefined = { types: [], tokenArr: tokens, tokenArrIndex: 0 };
	let frame: Frame;

	const stack = new Array<Frame>();

	let currentLine = new Array<Token>();
	const acc = new Array<Token[]>();

	for (; nextFrame; nextFrame = stack.pop()) {
		for (; (frame = nextFrame, frame.tokenArrIndex < frame.tokenArr.length); frame.tokenArrIndex++) {
			let { types } = frame;
			const token = frame.tokenArr[frame.tokenArrIndex];

			let content: string;

			// Determine content and append type to types if necessary
			if (typeof token === "string") {
				types = stack.length > 0 ? types : ["plain"];
				content = token;
			} else {
				types = appendTypes(types, token.type);
				if (token.alias) {
					types = appendTypes(types, token.alias);
				}

				if (typeof token.content === "string") {
					content = token.content;
				} else {
					let tokenArr: Array<string | Prism.Token>;
					if (Array.isArray(token.content)) {
						tokenArr = token.content;
					} else {
						tokenArr = [token.content];
					}

					stack.push(frame);
					nextFrame = {
						types,
						tokenArr,
						tokenArrIndex: 0,
					};
					continue;
				}
			}

			const splitByNewlines = content.split(newlineRe);
			const newlineCount = splitByNewlines.length;

			currentLine.push({ types, content: splitByNewlines[0] });

			for (let i = 1; i < newlineCount; i++) {
				normalizeEmptyLines(currentLine);
				acc.push(currentLine);
				currentLine = [{ types, content: splitByNewlines[i] }];
			}
		}
	}

	if (acc.length === 0) {
		return [[{
			types: ["plain"],
			content: "\n",
			empty: true,
		}]];
	}

	normalizeEmptyLines(currentLine);
	acc.push(currentLine);

	return acc;
};
