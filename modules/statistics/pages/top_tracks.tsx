import { React } from "/modules/stdlib/src/expose/React.ts";

import PageContainer from "../components/shared/page_container.tsx";
import { DEFAULT_TRACK_IMG } from "../static.ts";
import RefreshButton from "../components/buttons/refresh_button.tsx";
import { spotifyApi } from "/modules/Delusoire.delulib/lib/api.ts";
import type { Track } from "https://esm.sh/@fostertheweb/spotify-web-api-ts-sdk";
import { SpotifyTimeRange } from "../api/spotify.ts";
import { useStatus } from "../components/status/useStatus.tsx";
import { logger, settingsButton, storage } from "../mod.tsx";
import { useDropdown } from "/modules/stdlib/lib/components/index.tsx";
import CreatePlaylistButton from "../components/buttons/create_playlist_button.tsx";
import { useQuery } from "/modules/stdlib/src/webpack/ReactQuery.ts";
import {
	Tracklist,
	TracklistColumnsContextProvider,
	TracklistRow,
} from "/modules/stdlib/src/webpack/ReactComponents.ts";
import { getPlayContext, useTrackListColumns } from "/modules/stdlib/src/webpack/ReactHooks.ts";
import { SCROBBLES_COLUMN_TYPE } from "/modules/Delusoire.more-columns/columns.ts";
import { getLFMTracks } from "/modules/Delusoire.more-columns/patchPlaylistApi.ts";
import { exportedFunctions } from "/modules/stdlib/src/webpack/index.ts";
import { findBy } from "/hooks/util.ts";

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

const TrackRow = React.memo(
	({ webTrack, index }: { webTrack: Track; index: number }) => {
		const { usePlayContextItem } = getPlayContext({ uri: webTrack.uri }, {
			featureIdentifier: "queue",
		});

		return (
			<TracklistRow
				index={index}
				uri={webTrack.uri}
				name={webTrack.name}
				artists={webTrack.artists}
				imgUrl={webTrack.album.images.at(-1)?.url ?? DEFAULT_TRACK_IMG}
				isExplicit={webTrack.explicit}
				albumOrShow={webTrack.album}
				duration_ms={webTrack.duration_ms}
				usePlayContextItem={usePlayContextItem}
				allowedDropTypes={allowedDropTypes}
			/>
		);
	},
	(prev, next) => prev.webTrack.uri === next.webTrack.uri,
);

const useItemsCache = findBy("getItems", "invalidateCache", "limit")(exportedFunctions);

interface TracksPageContentProps {
	topTracks: Track[];
}
const TracksPageContent = ({ topTracks }: TracksPageContentProps) => {
	const columns = useTrackListColumns();

	const fetchTopTracks = React.useCallback(async (offset: number, limit: number) => {
		const items = topTracks.slice(offset, offset + limit);
		const lfmTracks = await getLFMTracks(items);
		topTracks.forEach((track, i) => {
			const lfmTrack = lfmTracks[i];
			track.lfmTrack = lfmTrack;
		});
		const totalLength = topTracks.length;
		return { items, totalLength };
	}, [topTracks]);

	const itemsCache = useItemsCache({
		nrItems: topTracks.length,
		fetch: fetchTopTracks,
		limit: 50,
		initialItems: [],
	});

	return (
		<Tracklist
			resolveItem={(track: any) => ({ uri: track.uri })}
			itemsCache={itemsCache}
			hasHeaderRow={true}
			columns={columns}
			renderRow={(track: Track, index: number) => (
				<TrackRow
					webTrack={track}
					index={index}
					key={track.uri}
				/>
			)}
			ariaLabel="Top Tracks"
			isCompactMode={false}
			columnPersistenceKey="stats-top-tracks-tracklist"
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
					tracks={topTracks!.map((track) => track.uri)}
				/>
			)}
			headerRight={[
				dropdown,
				status !== "pending" && <RefreshButton refresh={refetch} />,
				settingsButton,
			]}
		>
			{Status ?? (
				<TracklistColumnsContextProvider
					columns={["INDEX", "TITLE_AND_ARTIST", "ALBUM", SCROBBLES_COLUMN_TYPE, "DURATION"]}
				>
					<TracksPageContent topTracks={topTracks!} />
				</TracklistColumnsContextProvider>
			)}
		</PageContainer>
	);
};

export default React.memo(TracksPage);
