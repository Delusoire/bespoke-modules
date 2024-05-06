import { _ } from "/modules/official/stdlib/deps.js";
import { S } from "/modules/official/stdlib/index.js";
const formatValue = (name, value) => {
	if (typeof value === "string") return value;
	switch (name) {
		case "tempo":
			return `${Math.round(value)} bpm`;
		case "popularity":
			return `${Math.round(value)} %`;
		default:
			return `${Math.round(value * 100)} %`;
	}
};
const StatCard = ({ label, value }) =>
	/*#__PURE__*/ S.React.createElement(
		"div",
		{
			className: "LunqxlFIupJw_Dkx6mNx",
		},
		/*#__PURE__*/ S.React.createElement(
			S.ReactComponents.UI.Type,
			{
				as: "div",
				semanticColor: "textBase",
				variant: "alto",
			},
			formatValue(label, value),
		),
		/*#__PURE__*/ S.React.createElement(
			S.ReactComponents.UI.Type,
			{
				as: "div",
				semanticColor: "textBase",
				variant: "balladBold",
			},
			_.capitalize(label),
		),
	);
export default StatCard;
