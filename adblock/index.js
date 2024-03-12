import { S } from "/modules/Delusoire/stdlib/index.js";
const UserAPI = S.Platform.getUserAPI();
UserAPI._product_state_service.putOverridesValues({
    pairs: {
        ads: "0",
        catalogue: "premium",
        name: "Spotify",
        product: "premium"
    }
});
