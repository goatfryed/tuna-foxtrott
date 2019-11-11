import {createBoard, Player} from "../model";
import {Adventure} from "../model/Adventure";

export function createThugTown(user: Player) {
    const board = createBoard(5,4);

    const thugTown = new Adventure(board);
    const thugs = new Player("thugs");

    thugTown.players.push(user);
    thugTown.players.push(thugs);

    board[1][4].unit  = thugs.addUnit({name: "bully"});
    board[2][3].unit = thugs.addUnit({name: "thug"});

    return thugTown;
}