import {Player, PlayerUnit} from "../model";
import {Adventure} from "../model/Adventure";
import {ThugTownDescription} from "./ThugTown";

export interface AdventureDescription {
    id: number,
    name: string,
    factory: (user: Player, selectedUnits: PlayerUnit[]) => Adventure,
}

export const adventureDescriptions: AdventureDescription[] = [
    ThugTownDescription,
].map( (value,id) => ({...value, id}));