import {Bot} from "../model";
import {Adventure} from "../model/Adventure";
import {reaction} from "mobx";
import {obstacle} from "../model/board";
import {AdventureDescription, adventureFactory, Coordinate} from "./index";
import {playAggressive} from "./BotBehaviour";

const thugTownTerrain = [
    {
        terrain: obstacle,
        x: 3, y: 1,
    },
    {
        terrain: obstacle,
        x: 1, y: 2,
    },
    {
        terrain: obstacle,
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
        const thugs = new ThugTownBot("thugs");
        adventure.players.push(thugs);
        adventure.board.getCell(4,1).unit  = thugs.addUnit({name: "bully", baseHealth: 5, initiativeDelay: 90});
        adventure.board.getCell(3,2).unit = thugs.addUnit({name: "thug", baseHealth: 4});
    }
);

class ThugTownBot extends Bot {

    boot(adventure: Adventure): void {
        this.shutdownHandler.push(
            reaction(
                () => adventure.activeUnit,
                playAggressive(
                    adventure,
                    unit => unit.player === this,
                    unit => unit.player !== this && unit.isAlive
                )
            )
        );
    }
}

export const ThugTownDescription: Omit<AdventureDescription, "id"> = {
    name: "Thug Town",
    factory: createThugTown,
};