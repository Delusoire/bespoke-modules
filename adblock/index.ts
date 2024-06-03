import { Platform } from "/modules/official/stdlib/src/expose/Platform.ts";

const ProductStateAPI = Platform.getProductStateAPI();

ProductStateAPI.putOverridesValues({ pairs: { ads: "0", catalogue: "premium", name: "Spotify", product: "premium" } });
