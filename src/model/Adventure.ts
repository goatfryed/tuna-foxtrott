import {Board, Player, PlayerUnit} from "./index";
import {action, computed, observable} from "mobx";
import {ActionManager, AttackManager, MovementManager} from "../actions";

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

    private phaseRules:PhaseConfig<PhaseNames> = {
        "movement": {
            actionManager: new MovementManager(this),
            nextPhase: "attack",
        },
        "attack": {
            actionManager: new AttackManager(this),
            nextPhase: "movement",
        }
    };

    @observable
    private _currentPhase: PhaseNames = "movement";

    @computed
    get actions() {
        return this.getCurrentPhase().actionManager;
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
        this.setNextActions();
    }

    private setNextActions() {
        return this._currentPhase = this.getCurrentPhase().nextPhase;
    }

    private getCurrentPhase(): Phase<PhaseNames> {
        return this.phaseRules[this._currentPhase];
    }
}

interface Phase<PhaseNames extends string> {
    actionManager: ActionManager,
    nextPhase: PhaseNames,
}

type PhaseConfig<PhaseNames extends string> = {
    [key in PhaseNames]: Phase<PhaseNames>;
}

