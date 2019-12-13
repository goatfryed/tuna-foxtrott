import {action, computed, observable} from "mobx";
import {IngamePlayer} from "./index";
import {Cell} from "./board";
import {Unit, UnitImpl} from "./UnitImpl";
import {BoundAbility, DomainAction} from "../actions";

export class IngameUnit implements Unit {

    baseSpeed: number = 3;

    get id() {return this.wrapped.id;}
    get baseHealth() {return this.wrapped.baseHealth;}
    get name() {return this.wrapped.name;}
    get initiativeDelay() {return this.wrapped.initiativeDelay;}
    get staminaRegeneration() {return this.wrapped.staminaRegeneration;}
    get baseRange() {return this.wrapped.baseRange;}

    get abilities(): BoundAbility<DomainAction>[] {
        if (!isPlaced(this)) return [];

        return this.wrapped.abilities
            .map(ability => ability.apply(this as PlacedUnit))
            .filter((value): value is BoundAbility<DomainAction> => value !== null)
        ;
    }

    @observable initiative: number = 0;
    @observable mainActionUsed: boolean = false;

    constructor(
        readonly wrapped: UnitImpl,
        readonly player: IngamePlayer
    ) {

    }

    @observable private dmgTaken: number = 0;

    @computed get currentHealth() {
        return this.wrapped.definition.baseHealth - this.dmgTaken;
    }

    get maxHealth() {
        return this.wrapped.definition.baseHealth;
    }

    dealHealthDamage(delta: number) {
        this.dmgTaken = this.dmgTaken + delta;
        this.limitStamina();
    }

    @observable private _stamina: number = 0;
    set stamina(stamina: number) {
        this._stamina = stamina;
        this.limitStamina();
    }
    get stamina() { return this._stamina;}

    updateStamina(deltaIncrease: number) {
        this.stamina += deltaIncrease;
    }

    private limitStamina() { if (this._stamina > this.currentHealth) this._stamina = this.currentHealth}

    @observable private movePointsSpent: number = 0;

    get remainingMovePoints() {
        return this.baseSpeed - this.movePointsSpent;
    }

    spentMovePoints(delta: number) {
        this.movePointsSpent += delta;
    }

    restoreMovePoints() {
        this.movePointsSpent = 0;
    }

    @observable private _cell: Cell | null = null;

    //@TODO type hint will break if get is used before set
    set cell(cell: Cell|null) {
        this.setCell(cell);
    }

    get cell(): Cell|null {
        return this._cell;
    }


    @action
    private setCell(cell: Cell|null) {
        if (cell == this._cell) return;

        let lastCell = this._cell;
        this._cell = cell;

        if (lastCell !== null) {
            lastCell.unit = null;
        }
        if (cell !== null) {
            cell.unit = this;
        }
    }

    canAttack(unit: IngameUnit) {
        return !this.mainActionUsed
            && this.cell !== null
            && unit.cell !== null
            && this.cell.getManhattenDistance(unit.cell) <= 1;
    }

    @computed get exhausted() {
        return this.stamina <= 0;
    }

    @computed get isCombatReady() {
        return this.isAlive && !this.exhausted;
    }

    @computed get isAlive() {
        return this.currentHealth > 0;
    }

    toString() {
        return String(this.wrapped);
    }

    refresh() {
        this.stamina = this.maxHealth;
        this.mainActionUsed = false;
        this.movePointsSpent = 0;
    }
}

export type PlacedUnit = IngameUnit & {cell:  Cell};

export function isPlaced(unit: IngameUnit): unit is PlacedUnit {
    return unit.cell !== null;
}