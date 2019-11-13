import {Board, Player, PlayerUnit} from "./index";
import {observable} from "mobx";

export interface AdventureAware {
    adventure: Adventure
}

export class Adventure {

    @observable name: string = "test";
    @observable currentPlayer: Player | null = null;
    @observable activeUnit: PlayerUnit | null = null;
    @observable heroes: PlayerUnit[] = [];

    readonly players: Player[] = [];
    board: Board;

    constructor(board: Board) {
        this.board = board;
    }
}