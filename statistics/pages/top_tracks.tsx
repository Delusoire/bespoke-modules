import { S } from "/modules/official/stdlib/index.js";
const { React } = S;

import PageContainer from "../components/shared/page_container.js";
import { DEFAULT_TRACK_IMG } from "../static.js";
import RefreshButton from "../components/buttons/refresh_button.js";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.js";
import type { Track } from "@fostertheweb/spotify-web-api-ts-sdk";
import { SpotifyTimeRange } from "../api/spotify.js";
import { useStatus } from "../components/status/useStatus.js";
import { logger, settingsButton, storage } from "../index.js";
import { useDropdown } from "/modules/official/stdlib/lib/components/index.js";
import CreatePlaylistButton from "../components/buttons/create_playlist_button.js";

const DropdownOptions = { "Past Month": () => "Past Month", "Past 6 Months": () => "Past 6 Months", "All Time": () => "All Time" } as const;
const OptionToTimeRange = {
	"Past Month": SpotifyTimeRange.Short,
	"Past 6 Months": SpotifyTimeRange.Medium,
	"All Time": SpotifyTimeRange.Long,
} as const;

const columns = ["INDEX", "TITLE_AND_ARTIST", "ALBUM", "DURATION"];
const allowedDropTypes = [];

export const fetchTopTracks = (timeRange: SpotifyTimeRange) => spotifyApi.currentUser.topItems("tracks", timeRange, 50, 0);

const TrackRow = React.memo(({ track, index }: { track: Track; index: number }) => {
	const { usePlayContextItem } = S.getPlayContext({ uri: track.uri }, { featureIdentifier: "queue" });

	return (
		<S.ReactComponents.TracklistRow
			index={index}
			uri={track.uri}
			name={track.name}
			artists={track.artists}
			imgUrl={track.album.images.at(-1)?.url ?? DEFAULT_TRACK_IMG}
			isExplicit={track.explicit}
			albumOrShow={track.album}
			duration_ms={track.duration_ms}
			usePlayContextItem={usePlayContextItem}
			allowedDropTypes={allowedDropTypes}
		/>
	);
});

interface TracksPageContentProps {
	topTracks: any;
}
const TracksPageContent = ({ topTracks }: TracksPageContentProps) => {
	const thisRef = React.useRef(null);

	return (
		<S.ReactComponents.TracklistColumnsContextProvider columns={columns}>
			<S.ReactComponents.Tracklist
				ariaLabel="Top Tracks"
				hasHeaderRow={true}
				columns={columns}
				renderRow={(track: Track, index: number) => <TrackRow track={track} index={index} />}
				resolveItem={track => ({ uri: track.uri })}
				nrTracks={topTracks.length}
				fetchTracks={(offset, limit) => topTracks.slice(offset, offset + limit)}
				limit={50}
				outerRef={thisRef}
				tracks={topTracks}
				isCompactMode={false}
				columnPersistenceKey="stats-top-tracks"
			>
				spotify:app:stats:tracks
			</S.ReactComponents.Tracklist>
		</S.ReactComponents.TracklistColumnsContextProvider>
	);
};

const TracksPage = () => {
	const [dropdown, activeOption] = useDropdown({ options: DropdownOptions, storage, storageVariable: "top-tracks" });
	const timeRange = OptionToTimeRange[activeOption];

	const { status, error, data, refetch } = S.ReactQuery.useQuery({
		queryKey: ["topTracks", timeRange],
		queryFn: () => fetchTopTracks(timeRange),
	});

	const Status = useStatus({ status, error, logger });

	const topTracks = data?.items;

	return (
		<PageContainer
			title="Top Tracks"
			headerLeft={
				status === "success" && <CreatePlaylistButton name={`Top Songs - ${activeOption}`} tracks={topTracks.map(track => track.uri)} />
			}
			headerRight={[dropdown, status !== "pending" && <RefreshButton refresh={refetch} />, settingsButton]}
		>
			{Status || <TracksPageContent topTracks={topTracks} />}
		</PageContainer>
	);
};

export default React.memo(TracksPage);
