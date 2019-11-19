import {Bot, createBoard, Player} from "../model";
import {Adventure} from "../model/Adventure";
import {autorun} from "mobx";

export function createThugTown(user: Player) {
    const board = createBoard(5,4);

    const thugTown = new Adventure(board);
    const thugs = new ThugTownBot("thugs");

    thugTown.players.push(user);
    thugTown.players.push(thugs);

    board[1][4].unit  = thugs.addUnit({name: "bully", baseHealth: 5, initiativeDelay: 90});
    board[2][3].unit = thugs.addUnit({name: "thug", baseHealth: 4});

    return thugTown;
}

class ThugTownBot extends Bot {

    boot(adventure: Adventure): void {
        this.shutdownHandler.push(autorun(() => {
            const activeUnit = adventure.activeUnit;
            if (activeUnit.player !== this) {
                return;
            }
            alert(activeUnit.name + " passes");
            adventure.endTurn();
        }));
    }
}