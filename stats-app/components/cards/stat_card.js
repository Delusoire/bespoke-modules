import { S } from "/modules/Delusoire/stdlib/index.js";
function formatValue(name, value) {
	if (typeof value === "string") return value;
	switch (name) {
		case "tempo":
			return `${Math.round(value)} bpm`;
		case "popularity":
			return `${Math.round(value)} %`;
		default:
			return `${Math.round(value * 100)} %`;
	}
}
function normalizeString(inputString) {
	return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
}
function StatCard(props) {
	const { TextComponent } = S.ReactComponents;
	const { label, value } = props;
	return /*#__PURE__*/ S.React.createElement(
		"div",
		{
			className: "LunqxlFIupJw_Dkx6mNx",
		},
		/*#__PURE__*/ S.React.createElement(
			TextComponent,
			{
				as: "div",
				semanticColor: "textBase",
				variant: "alto",
			},
			formatValue(label, value),
		),
		/*#__PURE__*/ S.React.createElement(
			TextComponent,
			{
				as: "div",
				semanticColor: "textBase",
				variant: "balladBold",
			},
			normalizeString(label),
		),
	);
}
export default StatCard;
