import {User, UserPlayer} from "../model";
import {Adventure} from "../model/Adventure";
import {ThugTownDescription} from "./ThugTown";
import {Board, createBoard, TerrainDescriptor} from "../model/board";
import {IngameUnit} from "../model/IngameUnit";
import {MoshPitDescription} from "./MoshPit";
import {UnitImpl} from "../model/UnitImpl";

export interface AdventureDescription {
    id: number,
    name: string,
    factory: (user: User, selectedUnits: UnitImpl[]) => Adventure,
}

export const adventureDescriptions: AdventureDescription[] = [
    ThugTownDescription,
    MoshPitDescription,
].map( (value,id) => ({...value, id}));
export type Coordinate = [number, number];

export function adventureFactory(
    sizeX: number, sizeY: number,
    terrain: TerrainDescriptor[],
    startLocations: Coordinate[],
    setup: (adventure: Adventure) => void,
) {
    return (user: User, adventuringUnits: UnitImpl[]) => {
        const board = createBoard(sizeX, sizeY, terrain);

        const userPlayer = new UserPlayer(user);
        adventuringUnits.forEach(u => userPlayer.addUnit(u));

        const adventure = new Adventure(board);
        adventure.players.push(userPlayer);
        setup(adventure);
        placeUnits(board, startLocations, userPlayer.units);
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

