import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";
import { capitalize } from "/modules/stdlib/deps.ts";

interface StatCardProps {
	label: string;
	value: number | string;
}

const pitchClasses = [
	"do",
	"do♯/re♭",
	"re",
	"re♯/mi♭",
	"mi",
	"fa",
	"fa♯/sol♭",
	"sol",
	"sol♯/la♭",
	"la",
	"la♯/si♭",
	"si",
];

const formatValue = (name: string, value: string | number) => {
	if (typeof value === "string") return value;

	switch (name) {
		case "acousticness":
		case "danceability":
		case "energy":
		case "instrumentalness":
		case "liveness":
		case "speechiness":
		case "valence":
			return `${Math.round(value * 100)} %`;
		case "key":
			return pitchClasses[Math.round(value)];
		case "loudness":
			return `${value.toFixed(1)} db`;
		case "tempo":
			return `${Math.round(value)} bpm`;
		case "time_signature":
			return `${Math.round(value)}/4`;
		default:
			return value.toFixed(2);
	}
};

const StatCard = ({ label, value }: StatCardProps) => (
	<div className="main-card-card">
		<UI.Type as="div" semanticColor="textBase" variant="alto">
			{formatValue(label, value)}
		</UI.Type>
		<UI.Type as="div" semanticColor="textBase" variant="balladBold">
			{capitalize(label)}
		</UI.Type>
	</div>
);

export default StatCard;
