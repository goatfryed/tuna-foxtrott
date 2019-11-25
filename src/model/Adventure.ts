import {Bot, isPlaced, PlacedUnit, Player, PlayerUnit} from "./index";
import {action, computed, observable, reaction} from "mobx";
import {ActionManager} from "../actions";
import {Board} from "./board";

export interface AdventureAware {
    adventure: Adventure
}

export class Adventure {

    @observable name: string = "test";
    @observable heroes: PlayerUnit[] = [];
    @observable actionPhase = false;

    readonly players: Player[] = [];
    readonly board: Board;

    private _actionManager: ActionManager = new ActionManager(this);

    get actionManager() {
        return this._actionManager;
    }

    get activeUnit(): PlayerUnit|null {
        return this.actionPhase ? this.turnOrder[0] || null : null;
    }

    @computed
    get turnOrder(): PlacedUnit[] {
        return this.players.flatMap(p => p.units)
            .filter(isPlaced)
            .filter(u => u.isAlive)
            .sort( Adventure.sortForTurnOrder)
        ;
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
        this.actionPhase = false;
    }

    @action
    setup() {
        this.actionPhase = false;

        this.players
            .filter((p: Player): p is Bot => p instanceof Bot)
            .forEach(bot => bot.boot(this))
        ;

        reaction(
            () => ({
                nextUnit: this.turnOrder[0],
                isPrepPhase: !this.actionPhase
            }),
            ({nextUnit, isPrepPhase}) => {
                if (!isPrepPhase) {
                    return;
                }
                nextUnit.exhausted = false;
                nextUnit.restoreMovePoints();
                this.actionPhase = true;
            }
        );

        setTimeout(() => this.actionPhase = true);
    }

    tearDown() {
        this.players
            .filter((p: Player): p is Bot => p instanceof Bot)
            .forEach(bot => bot.shutdown())
        ;
    }

    isWonBy(user: Player) {
        return !this.players
            .filter(Adventure.playerIsAlive)
            .some(p => p !== user);
    }

    isLostBy(player: Player) {
        return !Adventure.playerIsAlive(player);
    }

    private static playerIsAlive(player: Player) {
        return player.units.some(u => u.isAlive);
    }

}