import {OBSTACLE} from "../model/board";
import {AdventureDescription, adventureFactory, Coordinate} from "./index";
import {ZergBot} from "./BotBehaviour";
import {UnitImpl} from "../model/UnitImpl";
import {BullyDefinition, ThugDefinition} from "./Gangsters";

function localObstacle(x:number,y:number) {
    return {
        terrain: OBSTACLE,
        x, y,
    }
}

const terrain = [
    localObstacle(3,2),
    localObstacle(3,3),
    localObstacle(4,2),
    localObstacle(4,3),
];
const startLocations: Coordinate[] = [
    [1,2],[1,3],[0,2],[0,3]
];

export const createMoshPit = adventureFactory(
    8,6,
    terrain,
    startLocations,
    adventure => {
        const thugs = new ZergBot("thugs");
        adventure.players.push(thugs);
        adventure.board.getCell(6,2).unit  = thugs.addUnit(new UnitImpl("bully", BullyDefinition));
        adventure.board.getCell(6,3).unit  = thugs.addUnit(new UnitImpl("bully", BullyDefinition));
        adventure.board.getCell(5,0).unit = thugs.addUnit(new UnitImpl("thug", ThugDefinition));
        adventure.board.getCell(7,1).unit = thugs.addUnit(new UnitImpl("thug", ThugDefinition));
        adventure.board.getCell(7,4).unit = thugs.addUnit(new UnitImpl("thug", ThugDefinition));
        adventure.board.getCell(5,5).unit = thugs.addUnit(new UnitImpl("thug", ThugDefinition));
    }
);

export const MoshPitDescription: Omit<AdventureDescription, "id"> = {
    name: "Mosh Pit",
    factory: createMoshPit,
};