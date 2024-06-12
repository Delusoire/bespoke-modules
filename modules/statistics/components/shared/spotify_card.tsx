import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";
import { Cards, Menus, RightClickMenu } from "/modules/official/stdlib/src/webpack/ReactComponents.ts";

interface SpotifyCardProps {
	type: "artist" | "album" | "lastfm" | "playlist" | "show";
	uri: string;
	header: string;
	subheader: string;
	imageUrl: string;
}

const SpotifyCard = (props: SpotifyCardProps) => {
	const { type, header, uri, imageUrl, subheader } = props;

	const getMenu = () => {
		switch (type) {
			case "artist":
				return <Menus.Artist uri={uri} />;
			case "album":
				return <Menus.Album uri={uri} />;
			case "playlist":
				return <Menus.Playlist uri={uri} />;
			case "show":
				return <Menus.PodcastShow uri={uri} />;
			default:
				return undefined;
		}
	};
	const lastfmProps = type === "lastfm"
		? { onClick: () => window.open(uri, "_blank"), isPlayable: false, delegateNavigation: true }
		: {};

	return (
		<RightClickMenu menu={getMenu()}>
			<Cards.Generic
				featureIdentifier={type}
				headerText={header}
				renderCardImage={() => (
					<Cards.CardImage
						images={[
							{
								height: 640,
								url: imageUrl,
								width: 640,
							},
						]}
						isCircular={type === "artist"}
					/>
				)}
				renderSubHeaderContent={() => (
					<UI.Type as="div" variant="mesto" semanticColor="textSubdued">
						{subheader}
					</UI.Type>
				)}
				uri={uri}
				{...lastfmProps}
			/>
		</RightClickMenu>
	);
};

export default SpotifyCard;
