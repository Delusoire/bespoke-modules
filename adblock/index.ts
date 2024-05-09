import { S } from "/modules/official/stdlib/index.js";

const ProductStateAPI = S.Platform.getProductStateAPI();

ProductStateAPI.putOverridesValues({ pairs: { ads: "0", catalogue: "premium", name: "Spotify", product: "premium" } });
