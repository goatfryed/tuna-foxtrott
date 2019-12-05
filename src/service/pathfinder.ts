import {Board, Cell} from "../model/board";
import {IngameUnit, PlacedUnit} from "../model/IngameUnit";

interface PathItem {
    cell: Cell,
    predecessor: PathItem | null,
    cost: number,
    distance: number,
}

export interface Path {
    steps: PathItem[],
    cost: number,
}

function getCost(unit: IngameUnit, cell: Cell) {
    if (!cell.terrain.isPassable) {
        return null;
    }
    if (
        cell.unit !== null
        && cell.unit.player !== unit.player
        && cell.unit.isAlive
    ) {
        return null;
    }
    return 1;
}

function findPathWithAStar(
    unit: PlacedUnit,
    board: Board,
    target: Cell,
    {approachOnly}: PathComputationOptions
) {

    const start = unit.cell;
    const itemStore: Array<PathItem> = [];

    function storeIndex(cell: Cell) {
        return cell.y * board.sizeX + cell.x;
    }

    const asQueueItem = (cell: Cell, predecessor: PathItem | null, cost: number): PathItem => {
        const item = {
            cell,
            predecessor,
            cost,
            distance: cell.getManhattenDistance(target)
        };
        itemStore[storeIndex(cell)] = item;
        return item;
    };

    function pathComparator(a: PathItem, b: PathItem) {
        return (a.cost + a.distance) - (b.cost + b.distance)
    }

    const queue = [asQueueItem(start, null, 0)];
    const isVisited: boolean[][] = [];
    for (let y = 0; y < board.sizeY; y++) {
        isVisited[y] = Array(board.sizeX).fill(false);
    }

    function updateNeighbor(visitedItem: PathItem, neighborX: number, neighborY: number) {

        if (!board.isInBoard(neighborX, neighborY)) {
            return;
        }

        const neighbor = board.getCell(neighborX, neighborY);
        const stepCost = getCost(unit, neighbor);
        if (stepCost === null) {
            return;
        }
        if (!isVisited[neighborY][neighborX]) {
            queue.push(asQueueItem(neighbor, visitedItem, stepCost));
            return;
        }
        const neighborItem = itemStore[storeIndex(neighbor)];
        const tentativeScore = visitedItem.cost + stepCost;
        if (tentativeScore < neighborItem.cost) {
            neighborItem.cost = tentativeScore;
        }
    }

    let backtrackItem: PathItem | null = null;
    while (queue.length > 0) {
        const visitedItem = queue.shift() as PathItem;
        const {cell} = visitedItem;

        if (
            cell.equals(target)
            || (approachOnly && cell.isNeighbor(target) && cell.unit === null)
        ) {
            backtrackItem = visitedItem;
            break;
        }

        isVisited[cell.y][cell.x] = true;

        /**SOUTH*/updateNeighbor(visitedItem, cell.x, cell.y + 1);
        /**NORTH*/updateNeighbor(visitedItem, cell.x, cell.y - 1);
        /**EAST*/updateNeighbor(visitedItem, cell.x + 1, cell.y);
        /**WEST*/updateNeighbor(visitedItem, cell.x - 1, cell.y);

        queue.sort(pathComparator)
    }
    return backtrackItem;
}

interface PathComputationOptions {
    approachOnly: boolean,
}

const defaultOptions: PathComputationOptions = {
    approachOnly: false,
};

export function computePath(
    board: Board,
    unit: PlacedUnit,
    target: Cell,
    options: Partial<PathComputationOptions> = defaultOptions
): Path | null {
    const allOptions = {...defaultOptions, ...options};

    if (unit.cell.equals(target)) {
        return {
            steps: [{
                cell: target,
                cost: 0,
                distance: 0,
                predecessor: null,
            }],
            cost: 0,
        };
    }
    if (allOptions.approachOnly && unit.cell.isNeighbor(target)) {
        return {
            steps: [{
                cell: target,
                cost: 0,
                distance: 0,
                predecessor: null,
            }],
            cost: 0,
        };
    }

    let backtrackItem = findPathWithAStar(unit, board, target, allOptions);

    if (backtrackItem === null) {
        return null;
    }

    const steps: Array<PathItem> = [];
    let cost = 0;

    while (backtrackItem !== null) {
        steps.push(backtrackItem);
        cost += backtrackItem.cost;
        backtrackItem = backtrackItem.predecessor;
    }
    steps.reverse();
    return {steps, cost};
}