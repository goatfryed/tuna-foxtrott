import {action, computed, observable} from "mobx";

export interface UnitDefinition {
    name: string;
    readonly baseHealth: number;
    initiative?: number;
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

    initiative: number = 100;
    baseSpeed: number = 3;
    @observable exhausted: boolean = false;

    constructor(definition: UnitDefinition, readonly player: Player) {
        super(definition);
        if (definition.baseSpeed) this.baseSpeed = definition.baseSpeed;
        if (definition.initiative) this.initiative = definition.initiative;
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

export class Cell {

    constructor(public x: number, public  y: number) {}

    @observable private _unit: PlayerUnit | null = null;
    get unit() {return this._unit;}
    set unit(unit: PlayerUnit | null) {this.setUnit(unit);}
    @action private setUnit(unit: PlayerUnit | null) {
        if (unit == this._unit) return;

        let lastUnit = this._unit;
        this._unit = unit;

        if (lastUnit !== null) {
            lastUnit.cell = null;
        }
        if (unit !== null) {
            unit.cell = this;
        }
    }

    toString() {
        return "(" + this.x + "-" + this.y + ")";
    }

    isNeighbor(cell: Cell) {
        return 1 === this.getManhattenDistance(cell);
    }

    getManhattenDistance(cell: Cell) {
        return Math.abs(this.x - cell.x) + Math.abs(this.y - cell.y);
    }
}

export type Board = Cell[][];

export function createBoard(sizeX: number, sizeY: number) {
    const board: Board = [];
    for (let y = 0; y < sizeY; y++) {
        board[y] = [];
        for (let x = 0; x < sizeX; x++) {
            board[y][x] = new Cell(x, y);
        }
    }
    return board;
}

export class AppContext {
    constructor(readonly user: Player) {
        user.isUser = true;
    }
}
