import {Player} from "../model";
import {Adventure} from "../model/Adventure";
import {ThugTownDescription} from "./ThugTown";
import {Board, createBoard, TerrainDescriptor} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";

export interface AdventureDescription {
    id: number,
    name: string,
    factory: (user: Player, selectedUnits: IngameUnit[]) => Adventure,
}

export const adventureDescriptions: AdventureDescription[] = [
    ThugTownDescription,
].map( (value,id) => ({...value, id}));
export type Coordinate = [number, number];

export function adventureFactory(
    sizeX: number, sizeY: number,
    terrain: TerrainDescriptor[],
    startLocations: Coordinate[],
    setup: (adventure: Adventure) => void,
) {
    return (user: Player, playerUnits: IngameUnit[]) => {
        const board = createBoard(sizeX, sizeY, terrain);
        const adventure = new Adventure(board);
        adventure.players.push(user);
        setup(adventure);
        placeUnits(board, startLocations, playerUnits);
        return adventure;
    }
}

function placeUnits(board: Board, startLocations: Coordinate[], selectedUnits: IngameUnit[]) {
    for (let i = 0; i < startLocations.length; i++) {
        const unit = selectedUnits[i];
        const [x, y] = startLocations[i];
        if (unit !== undefined) {
            board.getCell(x, y).unit = unit;
        }
    }
}

