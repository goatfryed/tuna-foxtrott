import {Board, Player, PlayerUnit} from "./index";
import {action, observable} from "mobx";
import {ActionManager} from "../actions";

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

    readonly actions = new ActionManager(this);

    @action
    refresh() {
        this.heroes.forEach(
            h => {
                h.exhausted = false;
                h.restoreMovePoints()
            }
        )
    }

    endTurn() {
        this.refresh();
    }
}

