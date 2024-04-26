import { S } from "/modules/Delusoire/stdlib/index.js";
const SpotifyCard = (props)=>{
    const { Cards, Menus, RightClickMenu } = S.ReactComponents;
    const { Type } = S.ReactComponents.UI;
    const { type, header, uri, imageUrl, subheader } = props;
    const getMenu = ()=>{
        switch(type){
            case "artist":
                return /*#__PURE__*/ S.React.createElement(Menus.Artist, {
                    uri: uri
                });
            case "album":
                return /*#__PURE__*/ S.React.createElement(Menus.Album, {
                    uri: uri
                });
            case "playlist":
                return /*#__PURE__*/ S.React.createElement(Menus.Playlist, {
                    uri: uri
                });
            case "show":
                return /*#__PURE__*/ S.React.createElement(Menus.PodcastShow, {
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
    return /*#__PURE__*/ S.React.createElement(RightClickMenu, {
        menu: getMenu()
    }, /*#__PURE__*/ S.React.createElement(Cards.Generic, {
        featureIdentifier: type,
        headerText: header,
        renderCardImage: ()=>/*#__PURE__*/ S.React.createElement(Cards.CardImage, {
                images: [
                    {
                        height: 640,
                        url: imageUrl,
                        width: 640
                    }
                ],
                isCircular: type === "artist"
            }),
        renderSubHeaderContent: ()=>/*#__PURE__*/ S.React.createElement(Type, {
                as: "div",
                variant: "mesto",
                semanticColor: "textSubdued"
            }, subheader),
        uri: uri,
        ...lastfmProps
    }));
};
export default SpotifyCard;
