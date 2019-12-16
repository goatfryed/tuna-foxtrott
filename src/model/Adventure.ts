import {Bot, IngamePlayer, isUserPlayer, UserPlayer} from "./index";
import {action, autorun, computed, observable, reaction} from "mobx";
import {DomainAction} from "../actions";
import {Board} from "./board";
import {IngameUnit, isPlaced, PlacedUnit} from "./IngameUnit";
import {Consumer, Immutable} from "../helpers";
import {assertNever, Runnable} from "../Utility";

export interface AdventureAware {
    adventure: Adventure
}

export class Adventure {

    @observable name: string = "test";
    @observable unitAction = false;
    @observable.ref actionLog: Immutable<{id: number, action: DomainAction}>[] = [];
    private nextLogId = 0;

    readonly players: IngamePlayer[] = [];
    readonly board: Board;

    readonly dispatcher: AdventureEventDispatcher = new AdventureEventDispatcher();

    private disposer: Runnable[] = [];

    get activeUnit(): PlacedUnit|undefined {
        return this.unitAction ? this.turnOrder[0] || undefined : undefined;
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

    constructor(readonly userPlayer: UserPlayer, board: Board) {
        this.board = board;
        this.players.push(userPlayer);
        this.onUnitTurnPrepPhase = this.onUnitTurnPrepPhase.bind(this);
    }

    @action
    endTurn() {
        const currentActive = this.activeUnit;
        if (!currentActive) {
            return;
        }
        currentActive.initiative += currentActive.initiativeDelay;
        this.unitAction = false;
    }

    @action
    setup() {
        this.unitAction = false;

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

        this.disposer.push(
            autorun(
                () => {
                    this.units
                        .filter(u => !u.isAlive)
                        .forEach(u => u.cell = null)
                }
            ),
            reaction(
                () => ({unit: this.turnOrder[0], actionPhase: this.unitAction}),
                this.onUnitTurnPrepPhase
            ),
        );

        setTimeout(() => this.unitAction = true);
    }

    /**
     * consider introduction of an event dispatcher
     * @param event
     */
    @action
    public onUnitTurnPrepPhase(
        {unit, actionPhase}:
        {unit: PlacedUnit|undefined, actionPhase: boolean}
    ) {
        if (actionPhase || !unit) {
            return;
        }

        unit.mainActionUsed = false;
        unit.restoreMovePoints();
        unit.updateStamina(unit.staminaRegeneration);

        this.dispatcher.dispatch({
            type: "UNIT_PREP_PHASE",
            adventure: this,
            data: {unit}
        });

        setTimeout( () => this.unitAction = true);
    }

    tearDown() {
        this.players
            .filter((p: IngamePlayer): p is Bot => p instanceof Bot)
            .forEach(bot => bot.shutdown())
        ;
        this.disposer.forEach(disposer => disposer());
    }

    isWon() {
        return !this.players
            .some(p => p !== this.userPlayer && Adventure.playerIsAlive(p));
    }

    isLost() {
        return !Adventure.playerIsAlive(this.userPlayer);
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

export const UNIT_PREP_PHASE = "UNIT_PREP_PHASE";
// export const UNIT_ACTION_PHASE = "UNIT_ACTION_PHASE";

interface UnitEventData {
    unit: PlacedUnit,
}
type AdventureEventDataMap = {
    UNIT_PREP_PHASE: UnitEventData,
    // UNIT_ACTION_PHASE: UnitEventData,
}
type AdventureEventMap = {
    [key in keyof AdventureEventDataMap]: {
        type: key,
        adventure: Adventure,
        data: AdventureEventDataMap[key]
    }
}
type AdventureEventListenerMap = {
    [key in keyof AdventureEventMap]: Consumer<AdventureEventMap[key]>[]
}

class AdventureEventDispatcher implements AdventureEventListenerMap {
    [UNIT_PREP_PHASE]: Consumer<AdventureEventMap[typeof UNIT_PREP_PHASE]>[] = [];
    // [UNIT_ACTION_PHASE]: Consumer<AdventureEventMap[typeof UNIT_ACTION_PHASE]>[] = [];

    /**
     * @param eventKey
     * @param listener
     * @return clean up function
     */
    addListener<K extends keyof AdventureEventMap>(
        eventKey: K,
        listener: Consumer<AdventureEventMap[K]>
    ) {
        // @ts-ignore memo: works obviously, but should check about better typing
        // ts merges event types instead of infering the right one
        this[eventKey].push(listener);
        return () => {
            // @ts-ignore
            this[eventKey] = this[eventKey].filter(l => l !== listener);
        }
    }

    dispatch<K extends keyof AdventureEventMap>(
        event: AdventureEventMap[K],
    ) {
        for (const listener of this[event.type]) {
            // @ts-ignore
            listener(event);
        }
    }
}

export interface GameSummary {
    started: Date,
    finished: Date,
    won: boolean,
}