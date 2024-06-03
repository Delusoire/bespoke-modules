import { React } from "/modules/official/stdlib/src/expose/React.js";
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
import { fp } from "/modules/official/stdlib/deps.js";
import { fetchAlbumsMeta, fetchArtistsMeta, fetchAudioFeaturesMeta } from "./playlist.js";
import { calculateTracksMeta } from "./top_genres.js";
import { getURI, toID } from "../util/parse.js";
import { useStatus } from "../components/status/useStatus.js";
import { logger, settingsButton, storage } from "../index.js";
import { useDropdown } from "/modules/official/stdlib/lib/components/index.js";
import { useQuery } from "/modules/official/stdlib/src/webpack/ReactQuery.js";
const DropdownOptions = {
    "Past Month": ()=>"Past Month",
    "Past 6 Months": ()=>"Past 6 Months",
    "All Time": ()=>"All Time"
};
const OptionToTimeRange = {
    "Past Month": SpotifyTimeRange.Short,
    "Past 6 Months": SpotifyTimeRange.Medium,
    "All Time": SpotifyTimeRange.Long
};
const LibraryPageContent = ({ genres, artists, albums, playlists, duration, releaseDates, tracks, audioFeatures })=>{
    const statCards = Object.entries(audioFeatures).map(([key, value])=>{
        return /*#__PURE__*/ React.createElement(StatCard, {
            label: key,
            value: value
        });
    });
    const artistCards = artists.slice(0, 10).map((artist)=>{
        return /*#__PURE__*/ React.createElement(SpotifyCard, {
            type: "artist",
            uri: artist.uri,
            header: artist.name,
            subheader: `Appears in ${artist.multiplicity} tracks`,
            imageUrl: artist.image
        });
    });
    const albumCards = albums.slice(0, 20).map((album)=>{
        return /*#__PURE__*/ React.createElement(SpotifyCard, {
            type: "album",
            uri: album.uri,
            header: album.name,
            subheader: `Appears in ${album.multiplicity} tracks`,
            imageUrl: album.image
        });
    });
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("section", {
        className: "stats-libraryOverview"
    }, /*#__PURE__*/ React.createElement(StatCard, {
        label: "Total Playlists",
        value: playlists.length.toString()
    }), /*#__PURE__*/ React.createElement(StatCard, {
        label: "Total Tracks",
        value: tracks.length.toString()
    }), /*#__PURE__*/ React.createElement(StatCard, {
        label: "Total Artists",
        value: artists.length.toString()
    }), /*#__PURE__*/ React.createElement(StatCard, {
        label: "Total Hours",
        value: (duration / 60 / 60).toFixed(1)
    })), /*#__PURE__*/ React.createElement(Shelf, {
        title: "Most Frequent Genres"
    }, /*#__PURE__*/ React.createElement(ContributionChart, {
        contributions: genres
    }), /*#__PURE__*/ React.createElement(InlineGrid, {
        special: true
    }, statCards)), /*#__PURE__*/ React.createElement(Shelf, {
        title: "Most Frequent Artists"
    }, /*#__PURE__*/ React.createElement(InlineGrid, null, artistCards)), /*#__PURE__*/ React.createElement(Shelf, {
        title: "Most Frequent Albums"
    }, /*#__PURE__*/ React.createElement(InlineGrid, null, albumCards)), /*#__PURE__*/ React.createElement(Shelf, {
        title: "Release Year Distribution"
    }, /*#__PURE__*/ React.createElement(ContributionChart, {
        contributions: releaseDates
    })));
};
const LibraryPage = ()=>{
    const [dropdown, activeOption] = useDropdown({
        options: DropdownOptions,
        storage,
        storageVariable: "top-genres"
    });
    const timeRange = OptionToTimeRange[activeOption];
    const { error, data, refetch, status } = useQuery({
        queryKey: [
            "libraryAnaysis",
            timeRange
        ],
        queryFn: async ()=>{
            const trackURIsInLibrary = Array.from(PlaylistItems).map(([k, v])=>v.size && k).filter(Boolean);
            const tracks = await getTracksFromURIs(trackURIsInLibrary);
            const duration = tracks.map((track)=>track.duration_ms).reduce(fp.add);
            const { explicitness, obscureTracks, popularity, releaseDates } = calculateTracksMeta(tracks);
            const trackURIs = tracks.map(getURI);
            const trackIDs = trackURIs.map(toID);
            const audioFeatures = await fetchAudioFeaturesMeta(trackIDs);
            const albumIDs = tracks.map((track)=>track.album.id);
            const artistIDs = tracks.flatMap((track)=>track.artists.map((artist)=>artist.id));
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
                    popularity
                })
            };
        }
    });
    const Status = useStatus({
        status,
        error,
        logger
    });
    return /*#__PURE__*/ React.createElement(PageContainer, {
        title: "Library Analysis",
        headerRight: [
            dropdown,
            status !== "pending" && /*#__PURE__*/ React.createElement(RefreshButton, {
                refresh: refetch
            }),
            settingsButton
        ]
    }, Status || /*#__PURE__*/ React.createElement(LibraryPageContent, data));
};
export default React.memo(LibraryPage);
