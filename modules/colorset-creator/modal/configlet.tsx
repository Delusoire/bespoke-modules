import CodeHighlightingExample from "../slate/code-hightlighting.tsx";
import { Configlet, ConfigletManager } from "../src/configlet.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
// import CodeHighlightingExample from "../slate/code-hightlighting.tsx";

interface ConfigletSlateDocumentProps {
	configlet: Configlet;
	configletManager: ConfigletManager;
}
export const ConfigletSlateDocument = ({}: ConfigletSlateDocumentProps) => {
	return <CodeHighlightingExample />;
};
