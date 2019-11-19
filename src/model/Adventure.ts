import {Board, Player, PlayerUnit} from "./index";
import {action, observable} from "mobx";
import {ActionManager} from "../actions";

export interface AdventureAware {
    adventure: Adventure
}

type PhaseNames = "movement" | "attack";
export class Adventure {

    @observable name: string = "test";
    @observable currentPlayer: Player | null = null;
    @observable activeUnit: PlayerUnit | null = null;
    @observable heroes: PlayerUnit[] = [];

    readonly players: Player[] = [];
    board: Board;

    private _actionManager: ActionManager = new ActionManager(this);

    @observable
    private _currentPhase: PhaseNames = "movement";

    get actionManager() {
        return this._actionManager;
    }

    constructor(board: Board) {
        this.board = board;
    }

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
