import {Player} from "../model";
import {Adventure} from "../model/Adventure";
import {ThugTownDescription} from "./ThugTown";

export interface AdventureDescription {
    id: number,
    name: string,
    factory: (user: Player) => Adventure,
}

export const adventureDescriptions: AdventureDescription[] = [
    ThugTownDescription,
].map( (value,id) => ({...value, id}));