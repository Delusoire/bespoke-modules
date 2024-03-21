import { S } from "/modules/Delusoire/stdlib/index.js";
const { React } = S;

import SpotifyCard from "../components/shared/spotify_card.js";
import PageContainer from "../components/shared/page_container.js";
import RefreshButton from "../components/buttons/refresh_button.js";
import { fetchLFMTopAlbums } from "../api/lastfm.js";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import { DEFAULT_TRACK_IMG } from "../static.js";
import { CONFIG } from "../settings.js";

import { SpotifyTimeRange } from "../api/spotify.js";
import { useStatus } from "../components/status/useStatus.js";
import { logger, settingsButton, storage } from "../index.js";
import { useDropdown } from "/modules/Delusoire/stdlib/lib/components/index.js";

const DropdownOptions = { "Past Month": () => "Past Month", "Past 6 Months": () => "Past 6 Months", "All Time": () => "All Time" } as const;
const OptionToTimeRange = {
	"Past Month": SpotifyTimeRange.Short,
	"Past 6 Months": SpotifyTimeRange.Medium,
	"All Time": SpotifyTimeRange.Long,
} as const;

interface AlbumsPageContentProps {
	topAlbums: any[];
}
const AlbumsPageContent = ({ topAlbums }: AlbumsPageContentProps) => {
	return (
		<div className={"main-gridContainer-gridContainer grid"}>
			{topAlbums.map((album, index) => {
				const type = album.uri.startsWith("https") ? "lastfm" : "album";
				return (
					<SpotifyCard
						type={type}
						uri={album.uri}
						header={album.name}
						subheader={`#${index + 1} Album`}
						imageUrl={album.images[0]?.url ?? DEFAULT_TRACK_IMG}
					/>
				);
			})}
		</div>
	);
};

const AlbumsPage = () => {
	const [dropdown, activeOption] = useDropdown({ options: DropdownOptions, storage, storageVariable: "top-artists" });
	const timeRange = OptionToTimeRange[activeOption];

	const { status, error, data, refetch } = S.ReactQuery.useQuery({
		queryKey: ["topAlbums", CONFIG.LFMUsername, timeRange],
		queryFn: async () => {
			const { topalbums } = await fetchLFMTopAlbums(CONFIG.LFMApiKey)(CONFIG.LFMUsername, timeRange);
			return await Promise.all(
				topalbums.album.map(async album => {
					const matchingSpotifyAlbums = await spotifyApi.search(`${album.name}+artist:${encodeURIComponent(album.artist.name)}`, ["album"]);
					return matchingSpotifyAlbums.albums.items[0];
				}),
			);
		},
	});

	const Status = useStatus({ status, error, logger });
	return (
		<PageContainer title="Top Albums" headerRight={[dropdown, status !== "pending" && <RefreshButton refresh={refetch} />, settingsButton]}>
			{Status || <AlbumsPageContent topAlbums={data} />}
		</PageContainer>
	);
};

export default React.memo(AlbumsPage);
