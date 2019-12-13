import {Bot, IngamePlayer, isUserPlayer, User, UserPlayer} from "./index";
import {action, autorun, computed, observable, reaction} from "mobx";
import {DomainAction} from "../actions";
import {Board} from "./board";
import {IngameUnit, isPlaced, PlacedUnit} from "./IngameUnit";
import {Immutable} from "../helpers";
import {ActionManager} from "../actions/ActionManager";
import {assertNever} from "../Utility";

export interface AdventureAware {
    adventure: Adventure
}

export class Adventure {

    @observable name: string = "test";
    @observable actionPhase = false;
    @observable.ref actionLog: Immutable<{id: number, action: DomainAction}>[] = [];
    private nextLogId = 0;

    readonly players: IngamePlayer[] = [];
    readonly board: Board;

    @observable.ref private _actionManager: ActionManager = new ActionManager(this);

    get actionManager() {
        return this._actionManager;
    }

    get activeUnit(): PlacedUnit|null {
        return this.actionPhase ? this.turnOrder[0] || null : null;
    }

    @computed
    get turnOrder(): PlacedUnit[] {
        return this.units
            .filter(isPlaced)
            .filter(u => u.isCombatReady)
            .sort( Adventure.sortForTurnOrder)
        ;
    }

    get units(): IngameUnit[] {
        return this.players.flatMap(p => p.units)
    }

    private static sortForTurnOrder(a: IngameUnit, b: IngameUnit) {
        // lower initiative should come first
        const iniOrder = a.initiative - b.initiative;
        if (iniOrder !== 0) {
            return iniOrder;
        }
        // player should always come first
        if (isUserPlayer(a.player) !== isUserPlayer(b.player)) {
            return isUserPlayer(b.player) ? -1 : +1;
        }
        return a.id - b.id;
    }

    constructor(board: Board) {
        this.board = board;
        this.onUnitTurnStart = this.onUnitTurnStart.bind(this);
    }

    @action
    endTurn() {
        const currentActive = this.activeUnit;
        if (!currentActive) {
            return;
        }
        currentActive.initiative += currentActive.initiativeDelay;
        this.actionPhase = false;
    }

    @action
    setup() {
        this.actionPhase = false;

        autorun(
            () => {
                this.units
                    .filter(u => !u.isAlive)
                    .forEach(u => u.cell = null)
            }
        );

        this.units.forEach(
            u => {
                u.refresh();
                u.initiative = u.initiativeDelay;
            }
        );

        this.players
            .filter((p: IngamePlayer): p is Bot => p instanceof Bot)
            .forEach(bot => bot.boot(this))
        ;

        reaction(
            () => ({
                nextUnit: this.turnOrder[0],
                isPrepPhase: !this.actionPhase
            }),
            this.onUnitTurnStart
        );

        setTimeout(() => this.actionPhase = true);
    }

    @action
    private onUnitTurnStart(
        {nextUnit, isPrepPhase}:
        {nextUnit: PlacedUnit, isPrepPhase: boolean}
    ) {
        if (!isPrepPhase) {
            return;
        }
        nextUnit.mainActionUsed = false;
        nextUnit.restoreMovePoints();
        nextUnit.updateStamina(nextUnit.staminaRegeneration);
        this.actionPhase = true;
        this._actionManager = new ActionManager(this);
    }

    tearDown() {
        this.players
            .filter((p: IngamePlayer): p is Bot => p instanceof Bot)
            .forEach(bot => bot.shutdown())
        ;
    }

    findUserPlayer(user: User): UserPlayer {
        return this.players
            .filter(isUserPlayer)
            .filter(p => p.user === user)
            [0]
        ;
    }

    isWonBy(user: User) {
        const userPlayer = this.findUserPlayer(user);
        return !this.players
            .filter(Adventure.playerIsAlive)
            .some(p => p !== userPlayer);
    }

    isLostBy(user: User) {
        return !Adventure.playerIsAlive(this.findUserPlayer(user));
    }

    private static playerIsAlive(player: IngamePlayer) {
        return player.units.some(u => u.isCombatReady);
    }

    @action
    apply(action: DomainAction) {
        const nextEntry = {
            id: this.nextLogId++,
            action,
        };
        this.actionLog = [...this.actionLog, nextEntry];
        Adventure.doApply(nextEntry.action);
    }

    private static doApply(action: DomainAction) {
        switch (action.type) {
            case "ATTACK": {
                action.target.updateStamina(- action.descriptor.staminaDmg);
                action.target.dealHealthDamage(action.descriptor.healthDmg);
                action.actor.updateStamina(-action.descriptor.staminaCost);
                action.actor.mainActionUsed = true;
                return;
            }
            case "MOVE": {
                action.actor.cell = action.target;
                action.actor.spentMovePoints(action.path.cost);
                return;
            }
            case "MIGRATE": {
                action.apply();
                return;
            }
            default: assertNever(action);
        }
    }
}