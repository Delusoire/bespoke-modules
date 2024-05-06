import { URIClass } from "/modules/official/stdlib/expose/webpack";
import { S } from "/modules/official/stdlib/index.js";

const { URI } = S;

export const getURI = ({ uri }) => uri as string;
export const toID = (uri: URIClass<any>) => URI.fromString(uri).id as string;
