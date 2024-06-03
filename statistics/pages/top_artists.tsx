import { React } from "/modules/official/stdlib/src/expose/React.ts";

import SpotifyCard from "../components/shared/spotify_card.tsx";
import PageContainer from "../components/shared/page_container.tsx";
import { DEFAULT_TRACK_IMG } from "../static.ts";
import RefreshButton from "../components/buttons/refresh_button.tsx";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.ts";

import { SpotifyTimeRange } from "../api/spotify.ts";
import { useStatus } from "../components/status/useStatus.tsx";
import { logger, settingsButton, storage } from "../index.tsx";
import { useDropdown } from "/modules/official/stdlib/lib/components/index.tsx";
import { useQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.ts";

const DropdownOptions = {
	"Past Month": () => "Past Month",
	"Past 6 Months": () => "Past 6 Months",
	"All Time": () => "All Time",
} as const;
const OptionToTimeRange = {
	"Past Month": SpotifyTimeRange.Short,
	"Past 6 Months": SpotifyTimeRange.Medium,
	"All Time": SpotifyTimeRange.Long,
} as const;

export const fetchTopArtists = (timeRange: SpotifyTimeRange) =>
	spotifyApi.currentUser.topItems("artists", timeRange, 50, 0);
interface ArtistsPageContentProps {
	topArtists: any[];
}
const ArtistsPageContent = ({ topArtists }: ArtistsPageContentProps) => {
	return (
		<div className={"main-gridContainer-gridContainer grid"}>
			{topArtists.map((artist, index) => (
				<SpotifyCard
					type={"artist"}
					uri={artist.uri}
					header={artist.name}
					subheader={`#${index + 1} Artist`}
					imageUrl={artist.images.at(-1)?.url ?? DEFAULT_TRACK_IMG}
				/>
			))}
		</div>
	);
};

const ArtistsPage = () => {
	const [dropdown, activeOption] = useDropdown({
		options: DropdownOptions,
		storage,
		storageVariable: "top-artists",
	});
	const timeRange = OptionToTimeRange[activeOption];

	const { status, error, data, refetch } = useQuery({
		queryKey: ["topArtists", timeRange],
		queryFn: () => fetchTopArtists(timeRange),
	});

	const Status = useStatus({ status, error, logger });

	return (
		<PageContainer
			title="Top Artists"
			headerRight={[dropdown, status !== "pending" && <RefreshButton refresh={refetch} />, settingsButton]}
		>
			{Status || <ArtistsPageContent topArtists={data.items} />}
		</PageContainer>
	);
};

export default React.memo(ArtistsPage);
