import { S } from "/modules/Delusoire/stdlib/index.js";
const { React } = S;

import StatCard from "../components/cards/stat_card.js";
import ContributionChart from "../components/cards/contribution_chart.js";
import SpotifyCard from "../components/shared/spotify_card.js";
import InlineGrid from "../components/inline_grid.js";
import PageContainer from "../components/shared/page_container.js";
import Shelf from "../components/shelf.js";
import RefreshButton from "../components/buttons/refresh_button.js";
import { SpotifyTimeRange } from "../api/spotify.js";
import { getTracksFromURIs } from "/modules/Delusoire/library-db/lib/db.js";
import { PlaylistItems, SavedPlaylists } from "/modules/Delusoire/library-db/index.js";
import { fp } from "/modules/Delusoire/stdlib/deps.js";
import { fetchAlbumsMeta, fetchArtistsMeta, fetchAudioFeaturesMeta } from "./playlist.js";
import { calculateTracksMeta } from "./top_genres.js";
import { getURI, toID } from "../util/parse.js";
import { useStatus } from "../components/status/useStatus.js";
import { logger, settingsButton, storage } from "../index.js";
import { useDropdown } from "/modules/Delusoire/stdlib/lib/components/index.js";

const DropdownOptions = { "Past Month": () => "Past Month", "Past 6 Months": () => "Past 6 Months", "All Time": () => "All Time" } as const;
const OptionToTimeRange = {
	"Past Month": SpotifyTimeRange.Short,
	"Past 6 Months": SpotifyTimeRange.Medium,
	"All Time": SpotifyTimeRange.Long,
} as const;

interface LibraryPageContentProps {
	duration: number;
	releaseDates: Record<string, number>;
	playlists: string[];
	genres: Record<string, number>;
	tracks: any[];
	albums: Array<{
		name: string;
		uri: string;
		image: string;
		releaseYear: number;
		multiplicity: number;
	}>;
	artists: Array<{
		name: string;
		uri: string;
		image: string;
		multiplicity: number;
	}>;
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
		explicitness: number;
		popularity: number;
	};
}
const LibraryPageContent = ({ genres, artists, albums, playlists, duration, releaseDates, tracks, audioFeatures }: LibraryPageContentProps) => {
	const statCards = Object.entries(audioFeatures).map(([key, value]) => {
		return <StatCard label={key} value={value} />;
	});

	const artistCards = artists.slice(0, 10).map(artist => {
		return (
			<SpotifyCard
				type="artist"
				uri={artist.uri}
				header={artist.name}
				subheader={`Appears in ${artist.multiplicity} tracks`}
				imageUrl={artist.image}
			/>
		);
	});

	const albumCards = albums.map(album => {
		return (
			<SpotifyCard
				type="album"
				uri={album.uri}
				header={album.name}
				subheader={`Appears in ${album.multiplicity} tracks`}
				imageUrl={album.image}
			/>
		);
	});

	return (
		<>
			<section className="stats-libraryOverview">
				<StatCard label="Total Playlists" value={playlists.length.toString()} />
				<StatCard label="Total Tracks" value={tracks.length.toString()} />
				<StatCard label="Total Artists" value={artists.length.toString()} />
				<StatCard label="Total Minutes" value={Math.floor(duration / 60).toString()} />
				<StatCard label="Total Hours" value={(duration / 60 / 60).toFixed(1)} />
			</section>
			<Shelf title="Most Frequent Genres">
				<ContributionChart contributions={genres} />
				<InlineGrid special>{statCards}</InlineGrid>
			</Shelf>
			<Shelf title="Most Frequent Artists">
				<InlineGrid>{artistCards}</InlineGrid>
			</Shelf>
			<Shelf title="Most Frequent Albums">
				<InlineGrid>{albumCards}</InlineGrid>
			</Shelf>
			<Shelf title="Release Year Distribution">
				<ContributionChart contributions={releaseDates} />
			</Shelf>
		</>
	);
};

const LibraryPage = () => {
	const [dropdown, activeOption] = useDropdown({ options: DropdownOptions, storage, storageVariable: "top-genres" });
	const timeRange = OptionToTimeRange[activeOption];

	const { error, data, refetch, status } = S.ReactQuery.useQuery({
		queryKey: ["libraryAnaysis", timeRange],
		queryFn: async () => {
			const trackURIsInLibrary = Array.from(PlaylistItems)
				.map(([k, v]) => v.size && k)
				.filter(Boolean);
			const tracks = await getTracksFromURIs(trackURIsInLibrary);

			const duration = tracks.map(track => track.duration_ms).reduce(fp.add);
			const { explicitness, obscureTracks, popularity, releaseDates } = calculateTracksMeta(tracks);

			const trackURIs = tracks.map(getURI);
			const trackIDs = trackURIs.map(toID);
			const audioFeatures = await fetchAudioFeaturesMeta(trackIDs);

			const albumIDs = tracks.map(track => track.album.id);
			const artistIDs = tracks.flatMap(track => track.artists.map(artist => artist.id));

			const { albums } = await fetchAlbumsMeta(albumIDs);
			const { artists, genres } = await fetchArtistsMeta(artistIDs);

			const playlists = Array.from(SavedPlaylists.keys());

			return {
				duration,
				releaseDates,
				playlists,
				genres,
				tracks,
				albums,
				artists,
				audioFeatures: Object.assign(audioFeatures, {
					explicitness,
					popularity,
				}),
			};
		},
	});

	const Status = useStatus({ status, error, logger });

	return (
		<PageContainer title="Library Analysis" headerRight={[dropdown, status !== "pending" && <RefreshButton refresh={refetch} />, settingsButton]}>
			{Status || <LibraryPageContent {...data} />}
		</PageContainer>
	);
};

export default React.memo(LibraryPage);
