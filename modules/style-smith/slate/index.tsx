import Prism from "https://esm.sh/prismjs";
import "https://esm.sh/prismjs/components/prism-css";
import { React } from "/modules/stdlib/src/expose/React.ts";
const { useCallback, useState } = React;
import { createEditor, Editor, Element, Node, NodeEntry, Range } from "https://esm.sh/slate";
import {
	Editable,
	RenderElementProps,
	RenderLeafProps,
	Slate,
	useSlate,
	useSlateStatic,
	withReact,
} from "https://esm.sh/slate-react";
import { withHistory } from "https://esm.sh/slate-history";
import isHotkey from "https://esm.sh/is-hotkey";
import { css } from "https://esm.sh/@emotion/css";
import { CodeBlockElement } from "./custom-types.d.ts";
import { normalizeTokens } from "./normalize-tokens.ts";
import { Configlet, ConfigletManager } from "../src/configlet.ts";

const ParagraphType = "paragraph";
const CodeBlockType = "code-block";
const CodeLineType = "code-line";

interface ConfigletEditorProps {
	configlet: Configlet;
	configletManager: ConfigletManager;
}
const ConfigletEditor = ({ configlet, configletManager }: ConfigletEditorProps) => {
	const [editor] = useState(() => withHistory(withReact(createEditor())));

	const decorate = useDecorate(editor);
	const onKeyDown = useOnKeydown(editor);

	return (
		<Slate editor={editor} initialValue={initialValue}>
			<SetNodeToDecorations />
			<Editable
				decorate={decorate}
				renderElement={ElementWrapper}
				renderLeaf={renderLeaf}
				onKeyDown={onKeyDown}
			/>
			<style>{prismThemeCss}</style>
		</Slate>
	);
};

const ElementWrapper = (props: RenderElementProps) => {
	const { attributes, children, element } = props;
	const editor = useSlateStatic();

	if (element.type === CodeBlockType) {
		return (
			<div
				{...attributes}
				className={css(`
        font-family: monospace;
        font-size: 16px;
        line-height: 20px;
        margin-top: 0;
        background: rgba(0, 20, 60, .03);
        padding: 5px 13px;
      `)}
				style={{ position: "relative" }}
				spellCheck={false}
			>
				{children}
			</div>
		);
	}

	if (element.type === CodeLineType) {
		return (
			<div {...attributes} style={{ position: "relative" }}>
				{children}
			</div>
		);
	}

	const Tag = editor.isInline(element) ? "span" : "div";
	return (
		<Tag {...attributes} style={{ position: "relative" }}>
			{children}
		</Tag>
	);
};

const renderLeaf = (props: RenderLeafProps) => {
	const { attributes, children, leaf } = props;
	const { text, ...rest } = leaf;

	return (
		<span {...attributes} className={Object.keys(rest).join(" ")}>
			{children}
		</span>
	);
};

const useDecorate = (editor: Editor) => {
	return useCallback(
		([node, path]: NodeEntry) => {
			if (Element.isElement(node) && node.type === CodeLineType) {
				const ranges = editor.nodeToDecorations!.get(node) || [];
				return ranges;
			}

			return [];
		},
		[editor.nodeToDecorations],
	);
};

const getChildNodeToDecorations = ([
	block,
	blockPath,
]: NodeEntry<CodeBlockElement>) => {
	const nodeToDecorations = new Map<Element, Range[]>();

	const text = block.children.map((line) => Node.string(line)).join("\n");
	const language = block.language;
	const tokens = Prism.tokenize(text, Prism.languages[language]);
	const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line
	const blockChildren = block.children as Element[];

	for (let index = 0; index < normalizedTokens.length; index++) {
		const tokens = normalizedTokens[index];
		const element = blockChildren[index];

		if (!nodeToDecorations.has(element)) {
			nodeToDecorations.set(element, []);
		}

		let start = 0;
		for (const token of tokens) {
			const length = token.content.length;
			if (!length) {
				continue;
			}

			const end = start + length;

			const path = [...blockPath, index, 0];
			const range = {
				anchor: { path, offset: start },
				focus: { path, offset: end },
				token: true,
				...Object.fromEntries(token.types.map((type) => [type, true])),
			};

			nodeToDecorations.get(element)!.push(range);

			start = end;
		}
	}

	return nodeToDecorations;
};

// precalculate editor.nodeToDecorations map to use it inside decorate function then
const SetNodeToDecorations = () => {
	const editor = useSlate();

	const blockEntries = Array.from(
		Editor.nodes(editor, {
			at: [],
			mode: "highest",
			match: (n) => Element.isElement(n) && n.type === CodeBlockType,
		}),
	);

	const nodeToDecorations = new Map(
		blockEntries.flatMap((blockEntry) => Array.from(getChildNodeToDecorations(blockEntry))),
	);

	editor.nodeToDecorations = nodeToDecorations;

	return null;
};

const useOnKeydown = (editor: Editor) => {
	const onKeyDown: React.KeyboardEventHandler = useCallback(
		(e) => {
			if (isHotkey("tab", e)) {
				// handle tab key, insert spaces
				e.preventDefault();

				Editor.insertText(editor, "  ");
			}
		},
		[editor],
	);

	return onKeyDown;
};

const toChildren = (content: string) => [{ text: content }];
const toCodeLines = (content: string): Element[] =>
	content
		.split("\n")
		.map((line) => ({ type: CodeLineType, children: toChildren(line) }));

const initialValue: Element[] = [
	{
		type: ParagraphType,
		children: toChildren(
			"Here's one containing a single paragraph block with some text in it:",
		),
	},
	{
		type: CodeBlockType,
		language: "css",
		children: toCodeLines(`
/* Modal Styles */

.MAP__modal__widget-generator__container {
	overflow: auto !important;
}

.palette-manager-modal {
	--input-bg: #202020;
	--color-input-bg: #121212;
	--secondary-bg: #202020;
	--border-radius: 4px;
	--gap-primary: 8px;
	--gap-secondary: 12px;
}

.palette-manager-modal__sidebar {
	.QZhV0hWVKlExlKr266jo {
		width: 100%;
	}
}

.palette-manager-modal__entity .palette__color-set .color-set__color-input .color-input__picker {
	&::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	&::-webkit-color-swatch {
		border: none;
		border-radius: 50%;
	}
}
`),
	},
	{
		type: ParagraphType,
		children: toChildren("There you have it!"),
	},
];

// Prismjs theme stored as a string instead of emotion css function.
// It is useful for copy/pasting different themes. Also lets keeping simpler Leaf implementation
// In the real project better to use just css file
const prismThemeCss = `
/**
 * prism.js default theme for JavaScript, CSS and HTML
 * Based on dabblet (http://dabblet.com)
 * @author Lea Verou
 */

code[class*="language-"],
pre[class*="language-"] {
    color: black;
    background: none;
    text-shadow: 0 1px white;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 1em;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
}

pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
    text-shadow: none;
    background: #b3d4fc;
}

pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
code[class*="language-"]::selection, code[class*="language-"] ::selection {
    text-shadow: none;
    background: #b3d4fc;
}

@media print {
    code[class*="language-"],
    pre[class*="language-"] {
        text-shadow: none;
    }
}

/* Code blocks */
pre[class*="language-"] {
    padding: 1em;
    margin: .5em 0;
    overflow: auto;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
    background: #f5f2f0;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
    padding: .1em;
    border-radius: .3em;
    white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
    color: slategray;
}

.token.punctuation {
    color: #999;
}

.token.namespace {
    opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
    color: #905;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
    color: #690;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
    color: #9a6e3a;
    /* This background color was intended by the author of this theme. */
    background: hsla(0, 0%, 100%, .5);
}

.token.atrule,
.token.attr-value,
.token.keyword {
    color: #07a;
}

.token.function,
.token.class-name {
    color: #DD4A68;
}

.token.regex,
.token.important,
.token.variable {
    color: #e90;
}

.token.important,
.token.bold {
    font-weight: bold;
}
.token.italic {
    font-style: italic;
}

.token.entity {
    cursor: help;
}
`;

export default ConfigletEditor;
