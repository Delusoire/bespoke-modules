import { URIClass } from "/modules/Delusoire/stdlib/expose/webpack";
import { S } from "/modules/Delusoire/stdlib/index.js";

const { URI } = S;

export const getURI = ({ uri }) => uri as string;
export const toID = (uri: URIClass<any>) => URI.fromString(uri).id as string;
