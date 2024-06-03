import { Platform } from "/modules/official/stdlib/src/expose/Platform.js";
const UserAPI = Platform.getUserAPI();
UserAPI._product_state_service.putOverridesValues({
	pairs: {
		ads: "0",
		catalogue: "premium",
		name: "Spotify",
		product: "premium",
	},
});
