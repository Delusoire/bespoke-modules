import { React } from "/modules/stdlib/src/expose/React.ts";
import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.xpui.js";

const TextColumn = ({ children }: { children: React.ReactNode }) => (
	<UI.Text as="div" variant="bodySmall" className="HxDMwNr5oCxTOyqt85gi">
		{children}
	</UI.Text>
);

const Playcount = React.memo(
	({ albumTrack }: { albumTrack: any }) => {
		const playcount = albumTrack.playcount ?? -1;
		return <TextColumn>{Number(playcount).toLocaleString()}</TextColumn>;
	},
);

const ReleaseDate = React.memo(
	({ album }: { album: any }) => {
		const releaseDate = album.date.isoString ?? null;
		return <TextColumn>{new Date(releaseDate).toLocaleString()}</TextColumn>;
	},
);

const Popularity = React.memo(
	({ webTrack }: { webTrack: any }) => {
		const popularity = webTrack.popularity ?? -1;
		return <TextColumn>{popularity}%</TextColumn>;
	},
);

const Scrobbles = React.memo(
	({ lfmTrack }: { lfmTrack: any }) => {
		const scrobbles = lfmTrack?.userplaycount ?? -1;
		return <TextColumn>{Number(scrobbles).toLocaleString()}</TextColumn>;
	},
);

export const PlaycountWrapper = React.memo(({ data }: any) => {
	const albumTrack = data.albumTrack;
	return albumTrack && <Playcount albumTrack={albumTrack} />;
});

export const ReleaseDateWrapper = React.memo(({ data }: any) => {
	const album = data.albumAlbum;
	return album && <ReleaseDate album={album} />;
});

export const PopularityWrapper = React.memo(({ data }: any) => {
	const webTrack = data.webTrack;
	return webTrack && <Popularity webTrack={webTrack} />;
});

export const ScrobblesWrapper = React.memo(({ data }: any) => {
	const lfmTrack = data.lfmTrack;
	return lfmTrack && <Scrobbles lfmTrack={lfmTrack} />;
});
