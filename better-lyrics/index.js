import { createEventBus } from "/modules/official/stdlib/index.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
import { createSettings } from "/modules/official/stdlib/lib/settings.js";
export let eventBus;
export let settings;
export default async function(mod) {
    eventBus = createEventBus(mod);
    [settings] = createSettings(mod);
    import("./settings.js");
    const { BackgroundRenderer, LyricRenderer } = await import("./betterLyrics.js");
    globalThis.__renderCinemaLyrics = ()=>{
        const PlayerAPI = Platform.getPlayerAPI();
        const [data, setData] = React.useState(PlayerAPI.getState());
        React.useEffect(()=>{
            const songListener = (e)=>{
                setData(e.data);
            };
            PlayerAPI.getEvents().addListener("update", songListener);
            return ()=>{
                PlayerAPI.getEvents().removeListener("update", songListener);
            };
        }, []);
        return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(BackgroundRenderer, {
            data: data
        }), /*#__PURE__*/ React.createElement(LyricRenderer, {
            data: data
        }));
    };
}
