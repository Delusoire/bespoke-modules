import { S } from "/modules/official/stdlib/index.js";
const { URI } = S;
export const getURI = ({ uri }) => uri;
export const toID = uri => URI.fromString(uri).id;
