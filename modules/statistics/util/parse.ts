import { fromString, URIClass } from "/modules/stdlib/src/webpack/URI.ts";

export const getURI = ({ uri }) => uri as string;
export const toID = (uri: URIClass<any>) => fromString(uri).id as string;
