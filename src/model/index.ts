import {action, computed, observable} from "mobx";
import {Adventure} from "./Adventure";
import {Cell} from "./board";

export interface UnitDefinition {
    name: string;
    readonly baseHealth: number;
    initiativeDelay?: number;
    baseSpeed?: number;
}

export class Unit implements UnitDefinition {

    protected static counter: number = 0;
    id: number;
    readonly baseHealth: number;
    readonly name: string;
    constructor(definition: UnitDefinition | Unit) {
        const {
            name,
            id,
            baseHealth
        } = definition as Unit;
        this.name = name;
        this.baseHealth = baseHealth;
        this.id = id !== undefined ? id : PlayerUnit.counter++;
    }

    toString() {
        return `${this.name}`;
    }
}

export class PlayerUnit extends Unit {

    initiativeDelay: number = 100;
    baseSpeed: number = 3;
    @observable initiative: number = this.initiativeDelay;
    @observable exhausted: boolean = false;

    constructor(definition: UnitDefinition, readonly player: Player) {
        super(definition);
        if (definition.baseSpeed) this.baseSpeed = definition.baseSpeed;
        if (definition.initiativeDelay) this.initiativeDelay = definition.initiativeDelay;
    }

    @observable private dmgTaken: number = 0;
    @computed get currentHealth() {
        return this.baseHealth - this.dmgTaken;
    }
    get maxHealth() {
        return this.baseHealth;
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

    get cell() {return this._cell;}

    set cell(cell: Cell|null) {this.setCell(cell);}

    @action private setCell(cell: Cell | null) {
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

    canAttack(unit: PlayerUnit) {
        return !this.exhausted
            && this.cell !== null
            && unit.cell !== null
            && this.cell.isNeighbor(unit.cell);
    }

    canReach(cell: Cell|number) {
        if (typeof cell !== "number") {
            cell = this.getPath(cell);
        }
        return cell <= this.baseSpeed;
    }

    getPath(cell: Cell) {
        if (!this.cell) return Infinity;
        return this.cell.getManhattenDistance(cell)
    }

    dealDamage(delta: number) {
        this.dmgTaken = this.dmgTaken + delta;
    }

    @computed get isAlive() {
        return this.currentHealth > 0;
    }
}

export class Player {
    @observable readonly units: PlayerUnit[] = [];

    isUser: boolean = false;

    constructor(public name: string) {}

    @action addUnit(unit: UnitDefinition) {
        let playerUnit = new PlayerUnit(unit, this);
        this.units.push(playerUnit);
        return playerUnit;
    }
}

export abstract class Bot extends Player {

    protected shutdownHandler: Array<() => void> = [];

    abstract boot(adventure: Adventure): void;

    shutdown() {
        this.shutdownHandler.forEach(handler => handler());
    }
}

export class AppContext {
    constructor(readonly user: Player) {
        user.isUser = true;
    }
}
