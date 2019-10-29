import {action, observable} from "mobx";

export class Hero {
    id: number;
    private static counter: number = 0;

    constructor(public name: string) {
        this.id = Hero.counter++;
    }

    @observable private _cell: CellModel | null = null;
    get cell() {return this._cell;}
    set cell(cell: CellModel | null) {this.setCell(cell);}

    @action private setCell(cell: CellModel | null) {
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

    toString() { return this.name;}
}

export class CellModel {

    constructor(public x: number, public  y: number) {}

    @observable private _unit: Hero | null = null;
    get unit() {return this._unit;}
    set unit(unit: Hero | null) {this.setUnit(unit);}
    @action private setUnit(unit: Hero | null) {
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

export type Board = CellModel[][];

export class AppStore {
    @observable name: string = "test";
    @observable heroes: Hero[] = [];
    @observable selected: Hero | null = null;
    board: Board  = [];

    constructor(public sizeX: number, public sizeY: number) {
        for (let y = 0; y < sizeY; y++) {
            this.board[y] = [];
            for (let x = 0; x < sizeX; x++) {
                this.board[y][x] = new CellModel(x,y);
            }
        }
    }

    @action
    addHero(hero: Hero) {
        this.heroes.push(hero);
    }
}