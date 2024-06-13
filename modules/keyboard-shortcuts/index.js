import { toggleInLibrary } from "/modules/Delusoire/delulib/lib/platform.js";
import { KEY_LIST, mousetrapInst } from "./sneak.js";
import { Bind, appScroll, appScrollY, openPage, rotateSidebar } from "./util.js";
import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
const UserAPI = Platform.getUserAPI();
const UpdateAPI = Platform.getUpdateAPI();
const History = Platform.getHistory();
const PlayerAPI = Platform.getPlayerAPI();
let sneakOverlay;
const binds = [
    new Bind("s", ()=>{
        sneakOverlay = document.createElement("sneak-overlay");
        document.body.append(sneakOverlay);
    }),
    new Bind("shift+i", async ()=>{
        await UserAPI._product_state_service.putValues({
            pairs: {
                "app-developer": "2"
            }
        });
        UpdateAPI.applyUpdate();
    }),
    new Bind("tab", ()=>rotateSidebar(1)),
    new Bind("shift+tab", ()=>rotateSidebar(-1)),
    new Bind("shift+h", History.goBack),
    new Bind("shift+l", History.goForward),
    new Bind("j", ()=>appScroll(1)),
    new Bind("k", ()=>appScroll(-1)),
    new Bind("g", ()=>appScrollY(0)),
    new Bind("shift+g", ()=>appScrollY(Number.MAX_SAFE_INTEGER)),
    new Bind("m", ()=>PlayerAPI._state.item?.uri && toggleInLibrary([
            PlayerAPI._state.item?.uri
        ])),
    new Bind("/", (e)=>{
        e.preventDefault();
        openPage("/search");
    })
];
binds.map((bind)=>bind.register());
mousetrapInst.bind(KEY_LIST, (e)=>sneakOverlay?.updateProps(e.key), "keypress");
mousetrapInst.bind("esc", ()=>sneakOverlay?.remove());