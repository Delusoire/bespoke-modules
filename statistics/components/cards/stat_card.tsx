import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.ts";
import { _ } from "/modules/official/stdlib/deps.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";

interface StatCardProps {
	label: string;
	value: number | string;
}

const formatValue = (name: string, value: string | number) => {
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

const StatCard = ({ label, value }: StatCardProps) => (
	<div className="main-card-card">
		<UI.Type as="div" semanticColor="textBase" variant="alto">
			{formatValue(label, value)}
		</UI.Type>
		<UI.Type as="div" semanticColor="textBase" variant="balladBold">
			{_.capitalize(label)}
		</UI.Type>
	</div>
);

export default StatCard;
