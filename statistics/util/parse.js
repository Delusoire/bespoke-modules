import { fromString } from "/modules/official/stdlib/src/webpack/URI.js";
export const getURI = ({ uri })=>uri;
export const toID = (uri)=>fromString(uri).id;
