import { S } from "/modules/Delusoire/stdlib/index.js";
const { React } = S;

import StatCard from "../components/cards/stat_card.js";
import ContributionChart from "../components/cards/contribution_chart.js";
import InlineGrid from "../components/inline_grid.js";
import PageContainer from "../components/shared/page_container.js";
import Shelf from "../components/shelf.js";

import RefreshButton from "../components/buttons/refresh_button.js";
import { fetchTopTracks } from "./top_tracks.js";
import { fetchTopArtists } from "./top_artists.js";
import { calculateGenresFromArtists, fetchAudioFeaturesMeta } from "./playlist.js";
import type { Track } from "@fostertheweb/spotify-web-api-ts-sdk";
import { getURI, toID } from "../util/parse.js";
import { SpotifyTimeRange } from "../api/spotify.js";
import { DEFAULT_TRACK_IMG } from "../static.js";
import { useStatus } from "../components/status/useStatus.js";
import { logger, settingsButton, storage } from "../index.js";
import { useDropdown } from "/modules/Delusoire/stdlib/lib/components/index.js";

const DropdownOptions = { "Past Month": () => "Past Month", "Past 6 Months": () => "Past 6 Months", "All Time": () => "All Time" } as const;
const OptionToTimeRange = {
	"Past Month": SpotifyTimeRange.Short,
	"Past 6 Months": SpotifyTimeRange.Medium,
	"All Time": SpotifyTimeRange.Long,
} as const;

const columns = ["INDEX", "TITLE_AND_ARTIST", "ALBUM", "DURATION"];
const allowedDropTypes = [];

export const calculateTracksMeta = (tracks: Track[]) => {
	let explicitCount = 0;
	let popularityTotal = 0;
	const releaseDates = {} as Record<string, number>;
	for (const track of tracks) {
		track.explicit && explicitCount++;
		popularityTotal += track.popularity;
		const releaseDate = new Date(track.album.release_date).getFullYear();
		releaseDates[releaseDate] ??= 0;
		releaseDates[releaseDate]++;
	}

	const obscureTracks = tracks.toSorted((a, b) => a.popularity - b.popularity).slice(0, 5);

	return { explicitness: explicitCount / tracks.length, popularity: popularityTotal / tracks.length, releaseDates, obscureTracks };
};

interface GenresPageContentProps {
	genres: Record<string, number>;
	releaseDates: Record<string, number>;
	obscureTracks: Track[];
	audioFeatures: {
		danceability: number;
		energy: number;
		key: number;
		loudness: number;
		mode: number;
		speechiness: number;
		acousticness: number;
		instrumentalness: number;
		liveness: number;
		valence: number;
		tempo: number;
		time_signature: number;
		popularity: number;
		explicitness: number;
	};
}
const GenresPageContent = (data: GenresPageContentProps) => {
	const { usePlayContextItem } = S.getPlayContext({ uri: "" }, { featureIdentifier: "queue" });

	const thisRef = React.useRef(null);

	const { genres, releaseDates, obscureTracks, audioFeatures } = data;

	const statsCards = Object.entries(audioFeatures).map(([key, value]) => <StatCard label={key} value={value} />);

	return (
		<>
			<section className="main-shelf-shelf Shelf">
				<ContributionChart contributions={genres} />
				<InlineGrid special>{statsCards}</InlineGrid>
			</section>
			<Shelf title="Release Year Distribution">
				<ContributionChart contributions={releaseDates} />
			</Shelf>
			<Shelf title="Most Obscure Tracks">
				<S.ReactComponents.TracklistColumnsContextProvider columns={columns}>
					<S.ReactComponents.Tracklist
						ariaLabel="Top Tracks"
						hasHeaderRow={false}
						columns={columns}
						renderRow={(track: Track, index: number) => (
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
						)}
						resolveItem={track => ({ uri: track.uri })}
						nrTracks={obscureTracks.length}
						fetchTracks={(offset, limit) => obscureTracks.slice(offset, offset + limit)}
						limit={5}
						outerRef={thisRef}
						tracks={obscureTracks}
						isCompactMode={false}
						columnPersistenceKey="stats-top-genres"
					>
						spotify:app:stats:genres
					</S.ReactComponents.Tracklist>
				</S.ReactComponents.TracklistColumnsContextProvider>
			</Shelf>
		</>
	);
};

const GenresPage = () => {
	const [dropdown, activeOption] = useDropdown({ options: DropdownOptions, storage, storageVariable: "top-genres" });
	const timeRange = OptionToTimeRange[activeOption];

	const { status, error, data, refetch } = S.ReactQuery.useQuery({
		queryKey: ["topGenres", timeRange],
		queryFn: async () => {
			const topTracks = await fetchTopTracks(timeRange);
			const topArtists = await fetchTopArtists(timeRange);

			const tracks = topTracks.items;
			const artists = topArtists.items;

			// ! very unscientific
			const genres = calculateGenresFromArtists(artists, i => artists.length - i);

			const trackURIs = tracks.map(getURI);
			const trackIDs = trackURIs.map(toID);
			const audioFeatures = await fetchAudioFeaturesMeta(trackIDs);

			const { explicitness, releaseDates, obscureTracks, popularity } = calculateTracksMeta(tracks);

			return {
				genres,
				releaseDates,
				obscureTracks,
				audioFeatures: Object.assign(audioFeatures, {
					popularity,
					explicitness,
				}),
			};
		},
	});

	const Status = useStatus({ status, error, logger });

	return (
		<PageContainer title="Top Genres" headerRight={[dropdown, status !== "pending" && <RefreshButton refresh={refetch} />, settingsButton]}>
			{Status || <GenresPageContent {...data} />}
		</PageContainer>
	);
};

export default React.memo(GenresPage);
