import {action, computed, observable} from "mobx";
import {Player} from "./index";
import {Cell} from "./board";
import {Unit, UnitImpl} from "./UnitImpl";

export class IngameUnit implements Unit {

    initiativeDelay: number = 100;
    baseSpeed: number = 3;

    get id() {return this.wrapped.id;}
    get baseHealth() {return this.wrapped.baseHealth;}
    get name() {return this.wrapped.name;}
    get specials() {return this.wrapped.specials;}

    @observable initiative: number = this.initiativeDelay;
    @observable exhausted: boolean = false;

    constructor(
        readonly wrapped: UnitImpl,
        readonly player: Player
    ) {}

    @observable private dmgTaken: number = 0;

    @computed get currentHealth() {
        return this.wrapped.definition.baseHealth - this.dmgTaken;
    }

    get maxHealth() {
        return this.wrapped.definition.baseHealth;
    }

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
        return !this.exhausted
            && this.cell !== null
            && unit.cell !== null
            && this.cell.getManhattenDistance(unit.cell) <= 1;
    }

    dealDamage(delta: number) {
        this.dmgTaken = this.dmgTaken + delta;
    }

    @computed get isAlive() {
        return this.currentHealth > 0;
    }

    toString() {
        return String(this.wrapped);
    }
}

export type PlacedUnit = IngameUnit & {cell:  Cell};

export function isPlaced(unit: IngameUnit): unit is PlacedUnit {
    return unit.cell !== null;
}