import { is } from "/modules/official/stdlib/src/webpack/URI.js";
export const isContentOfPersonalPlaylist = (subleaf)=>typeof subleaf[0] === "string" && is.Track(subleaf[0]);
