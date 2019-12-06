import {OBSTACLE} from "../model/board";
import {AdventureDescription, adventureFactory, Coordinate} from "./index";
import {ZergBot} from "./BotBehaviour";
import {UnitImpl} from "../model/UnitImpl";
import {BullyDefinition, ThugDefinition} from "./Gangsters";

const thugTownTerrain = [
    {
        terrain: OBSTACLE,
        x: 3, y: 1,
    },
    {
        terrain: OBSTACLE,
        x: 1, y: 2,
    },
    {
        terrain: OBSTACLE,
        x: 4, y: 3,
    }
];
const thugTownStartLocations: Coordinate[] = [
    [1,0],[0,1],[0,0]
];

export const createThugTown = adventureFactory(
    5,4,
    thugTownTerrain,
    thugTownStartLocations,
    adventure => {
        const thugs = new ZergBot("thugs");
        adventure.players.push(thugs);
        adventure.board.getCell(4,1).unit  = thugs.addUnit(new UnitImpl("bully", BullyDefinition));
        adventure.board.getCell(3,2).unit = thugs.addUnit(new UnitImpl("thug", ThugDefinition));
    }
);

export const ThugTownDescription: Omit<AdventureDescription, "id"> = {
    name: "Thug Town",
    factory: createThugTown,
};