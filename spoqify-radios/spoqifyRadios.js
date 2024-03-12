import { SpotifyLoc } from "/modules/Delusoire/delulib/lib/util.js";
import { CONFIG } from "./settings.js";
import { S, SVGIcons } from "/modules/Delusoire/stdlib/index.js";
import { useMenuItem } from "/modules/Delusoire/stdlib/src/registers/menu.js";
import { createIconComponent } from "/modules/Delusoire/stdlib/lib/createIconComponent.js";
const { URI } = S;
const History = S.Platform.getHistory();
const RootlistAPI = S.Platform.getRootlistAPI();
export const createAnonRadio = (uri)=>{
    const sse = new EventSource(`https://open.spoqify.com/anonymize?url=${uri.substring(8)}`);
    sse.addEventListener("done", (e)=>{
        sse.close();
        const anonUri = URI.fromString(e.data);
        History.push(anonUri.toURLPath(true));
        RootlistAPI.add([
            anonUri.toURI()
        ], SpotifyLoc.after.fromUri(CONFIG.anonymizedRadiosFolderUri));
    });
};
export const FolderPickerMenuItem = ()=>{
    const { props } = useMenuItem();
    const { uri } = props.reference;
    return /*#__PURE__*/ S.React.createElement(S.ReactComponents.MenuItem, {
        disabled: false,
        onClick: ()=>{
            CONFIG.anonymizedRadiosFolderUri = uri;
        },
        leadingIcon: createIconComponent({
            icon: SVGIcons["playlist-folder"]
        })
    }, "Choose for Anonymized Radios");
};
