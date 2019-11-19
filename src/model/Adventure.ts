import {Board, Bot, Player, PlayerUnit} from "./index";
import {action, computed, observable} from "mobx";
import {ActionManager} from "../actions";

export interface AdventureAware {
    adventure: Adventure
}

export class Adventure {

    @observable name: string = "test";
    @observable heroes: PlayerUnit[] = [];

    readonly players: Player[] = [];
    board: Board;

    private _actionManager: ActionManager = new ActionManager(this);

    get actionManager() {
        return this._actionManager;
    }

    get activeUnit(): PlayerUnit|null {
        return this.turnOrder[0] || null;
    }

    @computed
    get turnOrder() {
        return this.players.flatMap(p => p.units)
            .filter(u => u.isAlive)
            .sort( Adventure.sortForTurnOrder)
    }

    private static sortForTurnOrder(a: PlayerUnit, b: PlayerUnit) {
        // lower initiative should come first
        const iniOrder = a.initiative - b.initiative;
        if (iniOrder !== 0) {
            return iniOrder;
        }
        // player should always come first
        if (a.player.isUser !== b.player.isUser) {
            return a.player.isUser ? -1 : +1;
        }
        return a.id - b.id;
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

    @action
    endTurn() {
        const currentActive = this.activeUnit;
        if (!currentActive) {
            return;
        }
        this.refresh();
        currentActive.initiative += currentActive.initiativeDelay;
    }

    setup() {
        this.players
            .filter((p: Player): p is Bot => p instanceof Bot)
            .forEach(bot => bot.boot(this))
        ;
    }

    tearDown() {
        this.players
            .filter((p: Player): p is Bot => p instanceof Bot)
            .forEach(bot => bot.shutdown())
        ;
    }
}
