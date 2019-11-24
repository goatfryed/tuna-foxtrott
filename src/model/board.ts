import {action, observable} from "mobx";
import {PlayerUnit} from "./index";

class Terrain {
    constructor(
        readonly isPassable:boolean
    ) {}
}

export const obstacle = new Terrain(false);
export const ground = new Terrain(true);

export class Cell {

    constructor(
        public x: number,
        public  y: number,
        readonly terrain: Terrain,
    ) {
    }

    @observable private _unit: PlayerUnit | null = null;
    get unit() {
        return this._unit;
    }

    set unit(unit: PlayerUnit | null) {
        this.setUnit(unit);
    }

    @action
    private setUnit(unit: PlayerUnit | null) {
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
        return "(" + this.id + ")";
    }

    get id() {
        return this.x + "-" + this.y;
    }

    getManhattenDistance(cell: Cell) {
        return Math.abs(this.x - cell.x) + Math.abs(this.y - cell.y);
    }

    equals(other: Cell) {
        return this.x === other.x
            && this.y === other.y
    }

    isNeighbor(target: Cell) {
        return this.getManhattenDistance(target) <= 1;
    }
}

interface TerrainDescriptor {
    x: number,
    y: number,
    terrain: Terrain,
}

export class Board {

    constructor(
        readonly sizeX:number,
        readonly sizeY: number,
        readonly cells: ReadonlyArray<ReadonlyArray<Cell>>,
    ) {
    }

    isInBoard(x: number, y: number) {
        return 0 <= x && 0 <= y
            && x < this.sizeX
            && y < this.sizeY
    }

    guardBoardRange(x: number, y: number) {
        if (!this.isInBoard(x, y)) {
            throw new RangeError(`${x}-${y} not in board of size ${this.sizeX}-${this.sizeY}`);
        }
    }

    getCell(x: number, y: number) {
        this.guardBoardRange(x, y);
        return this.cells[y][x];
    }

    *getNeighbors(cell: Cell) {
        const directions = [
            [-1,0],
            [0,1],
            [1,0],
            [0,-1],
        ] ;

        for (const [xDiff,yDiff] of directions) {
            const neighborX = cell.x + xDiff;
            const neighborY = cell.y + yDiff;
            if (this.isInBoard(neighborX, neighborY)) {
                yield this.getCell(neighborX, neighborY);
            }
        }
    }
}

export function createBoard(sizeX: number, sizeY: number, terrainDescription: TerrainDescriptor[] = []) {
    const cells: Cell[][] = [];
    const terrainMap: (Terrain|undefined)[][] = [];
    for (const {x,y,terrain} of terrainDescription) {
        if (terrainMap[y] === undefined) {
            terrainMap[y] = [];
        }
        terrainMap[y][x] = terrain;
    }
    for (let y = 0; y < sizeY; y++) {
        cells[y] = [];
        for (let x = 0; x < sizeX; x++) {
            const terrain = (terrainMap[y] && terrainMap[y][x]) || ground;
            cells[y][x] = new Cell(x, y, terrain);
        }
    }
    return new Board(sizeX, sizeY, cells);
}