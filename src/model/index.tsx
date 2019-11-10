import {action, observable} from "mobx";

export interface UnitDefinition {
    name: string;
}

export interface ActionOption {
    name: string,
    getActionForCell: (cell: Cell) => (() => any) | null,
}

export class Unit implements UnitDefinition {

    protected static counter: number = 0;
    id: number;
    readonly name: string;

    constructor(definition: UnitDefinition | Unit) {
        const {name, id} = definition as Unit;
        this.name = name;
        this.id = id !== undefined ? id : PlayerUnit.counter++;
    }

    toString() {
        return `${this.name}`;
    }
}

export class PlayerUnit extends Unit {

    @observable readonly actions: ActionOption[] = [];
    // @ts-ignore // Object.assign assigns this definitely

    constructor(definition: UnitDefinition, readonly player: Player) {
        super(definition);
    }

    @observable private _cell: Cell | null = null;
    get cell() {return this._cell;}

    set cell(cell: Cell | null) {this.setCell(cell);}

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
}

export class Player {
    @observable readonly units: PlayerUnit[] = [];

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
}

export type Board = Cell[][];

export class AppStore {
    @observable name: string = "test";
    @observable currentPlayer: Player | null = null;
    @observable activeUnit: PlayerUnit | null = null;
    board: Board  = [];
    readonly players: Player[] = [];

    constructor(readonly sizeX: number, readonly sizeY: number, readonly user: Player) {
        this.players.push(user);
        for (let y = 0; y < sizeY; y++) {
            this.board[y] = [];
            for (let x = 0; x < sizeX; x++) {
                this.board[y][x] = new Cell(x,y);
            }
        }
    }
}