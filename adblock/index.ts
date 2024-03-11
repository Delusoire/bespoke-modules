import { S } from "/modules/Delusoire/std/index.js";

const UserAPI = S.Platform.getUserAPI();

UserAPI._product_state_service.putOverridesValues({ pairs: { ads: "0", catalogue: "premium", name: "Spotify", product: "premium" } });
