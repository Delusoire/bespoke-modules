import { _ } from "/modules/Delusoire/stdlib/deps.js";
import { S } from "/modules/Delusoire/stdlib/index.js";

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
		<S.ReactComponents.UI.Type as="div" semanticColor="textBase" variant="alto">
			{formatValue(label, value)}
		</S.ReactComponents.UI.Type>
		<S.ReactComponents.UI.Type as="div" semanticColor="textBase" variant="balladBold">
			{_.capitalize(label)}
		</S.ReactComponents.UI.Type>
	</div>
);

export default StatCard;
