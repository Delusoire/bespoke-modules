import { React } from "/modules/official/stdlib/src/expose/React.ts";

import PageContainer from "../components/shared/page_container.tsx";
import { DEFAULT_TRACK_IMG } from "../static.ts";
import RefreshButton from "../components/buttons/refresh_button.tsx";
import { spotifyApi } from "/modules/Delusoire/delulib/lib/api.ts";
import type { Track } from "https://esm.sh/@fostertheweb/spotify-web-api-ts-sdk";
import { SpotifyTimeRange } from "../api/spotify.ts";
import { useStatus } from "../components/status/useStatus.tsx";
import { logger, settingsButton, storage } from "../mod.tsx";
import { useDropdown } from "/modules/official/stdlib/lib/components/index.tsx";
import CreatePlaylistButton from "../components/buttons/create_playlist_button.tsx";
import { useQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.ts";
import {
	Tracklist,
	TracklistColumnsContextProvider,
	TracklistRow,
} from "/modules/official/stdlib/src/webpack/ReactComponents.ts";
import { getPlayContext, useTrackListColumns } from "/modules/official/stdlib/src/webpack/CustomHooks.ts";

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

const allowedDropTypes = new Array<never>();

export const fetchTopTracks = (timeRange: SpotifyTimeRange) =>
	spotifyApi.currentUser.topItems("tracks", timeRange, 50, 0);

const TrackRow = React.memo(({ track, index }: { track: Track; index: number; }) => {
	const { usePlayContextItem } = getPlayContext({ uri: track.uri }, { featureIdentifier: "queue" });

	return (
		<TracklistRow
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
	const columns = useTrackListColumns();
	return (
		<Tracklist
			ariaLabel="Top Tracks"
			hasHeaderRow={true}
			columns={columns}
			renderRow={(track: Track, index: number) => <TrackRow track={track} index={index} />}
			resolveItem={(track) => ({ uri: track.uri })}
			nrTracks={topTracks.length}
			fetchTracks={(offset, limit) => topTracks.slice(offset, offset + limit)}
			limit={50}
			tracks={topTracks}
			isCompactMode={false}
			columnPersistenceKey="stats-top-tracks"
		>
			spotify:app:stats:tracks
		</Tracklist>
	);
};

const TracksPage = () => {
	const [dropdown, activeOption] = useDropdown({
		options: DropdownOptions,
		storage,
		storageVariable: "top-tracks",
	});
	const timeRange = OptionToTimeRange[activeOption];

	const { status, error, data, refetch } = useQuery({
		queryKey: ["topTracks", timeRange],
		queryFn: () => fetchTopTracks(timeRange),
	});

	const Status = useStatus({ status, error, logger });

	const topTracks = data?.items;

	return (
		<PageContainer
			title="Top Tracks"
			headerLeft={status === "success" && (
				<CreatePlaylistButton
					name={`Top Songs - ${activeOption}`}
					tracks={topTracks.map((track) => track.uri)}
				/>
			)}
			headerRight={[dropdown, status !== "pending" && <RefreshButton refresh={refetch} />, settingsButton]}
		>
			{Status ?? (
				<TracklistColumnsContextProvider columns={["INDEX", "TITLE_AND_ARTIST", "ALBUM", "DURATION"]}>
					<TracksPageContent topTracks={topTracks} />
				</TracklistColumnsContextProvider>
			)}
		</PageContainer>
	);
};

export default React.memo(TracksPage);
