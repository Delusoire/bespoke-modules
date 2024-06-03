import { UI } from "/modules/official/stdlib/src/webpack/ComponentLibrary.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { Cards, Menus, RightClickMenu } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
const SpotifyCard = (props)=>{
    const { type, header, uri, imageUrl, subheader } = props;
    const getMenu = ()=>{
        switch(type){
            case "artist":
                return /*#__PURE__*/ React.createElement(Menus.Artist, {
                    uri: uri
                });
            case "album":
                return /*#__PURE__*/ React.createElement(Menus.Album, {
                    uri: uri
                });
            case "playlist":
                return /*#__PURE__*/ React.createElement(Menus.Playlist, {
                    uri: uri
                });
            case "show":
                return /*#__PURE__*/ React.createElement(Menus.PodcastShow, {
                    uri: uri
                });
            default:
                return undefined;
        }
    };
    const lastfmProps = type === "lastfm" ? {
        onClick: ()=>window.open(uri, "_blank"),
        isPlayable: false,
        delegateNavigation: true
    } : {};
    return /*#__PURE__*/ React.createElement(RightClickMenu, {
        menu: getMenu()
    }, /*#__PURE__*/ React.createElement(Cards.Generic, {
        featureIdentifier: type,
        headerText: header,
        renderCardImage: ()=>/*#__PURE__*/ React.createElement(Cards.CardImage, {
                images: [
                    {
                        height: 640,
                        url: imageUrl,
                        width: 640
                    }
                ],
                isCircular: type === "artist"
            }),
        renderSubHeaderContent: ()=>/*#__PURE__*/ React.createElement(UI.Type, {
                as: "div",
                variant: "mesto",
                semanticColor: "textSubdued"
            }, subheader),
        uri: uri,
        ...lastfmProps
    }));
};
export default SpotifyCard;
