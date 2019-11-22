import {Board, Cell, PlayerUnit} from "../model";
import {Adventure} from "../model/Adventure";
import {action} from "mobx";
import {NotNull} from "../helpers";

/**
 * business logic should be tied to the model
 * All actions here should just be callback creators
 * to delay execution of that business logic and bind arguments
 *
 * Please be aware, that ActionCreator and Action type are inferred from all exports of this file.
 * Therefore
 */


export enum ActionType {
    SELECT = "select",
    MOVE = "move",
    ATTACK = "attack",
    UNSELECT = "unselect",
}

export interface Action {
    run(): void,
    type: ActionType;
}

interface QueueItem {
    cell: Cell,
    predecessor: QueueItem|null,
    cost: number,
    distance: number,
}

interface Path {
    steps: Cell[],
    cost: number,
}

function getCost(unit: PlayerUnit, neighbor: Cell) {
    if (neighbor.unit !== null && neighbor.unit.player !== unit.player) {
        return null;
    }
    return 1;
}

function findPathWithAStar(unit: PlayerUnit & {cell: Cell}, board: Board, target: Cell) {
    const start = unit.cell;
    const itemStore: Array<QueueItem> = [];

    function storeIndex(cell: Cell) {
        return cell.y * board.sizeX + cell.x;
    }

    const asQueueItem = (cell: Cell, predecessor: QueueItem | null, cost: number): QueueItem => {
        const item = {
            cell,
            predecessor,
            cost,
            distance: cell.getManhattenDistance(target)
        };
        itemStore[storeIndex(cell)] = item;
        return item;
    };

    function pathComparator(a: QueueItem, b: QueueItem) {
        return (a.cost + a.distance) - (b.cost + b.distance)
    }

    const queue = [asQueueItem(start, null, 0)];
    const isVisited: boolean[][] = [];
    for (let y = 0; y < board.sizeY; y++) {
        isVisited[y] = Array(board.sizeX).fill(false);
    }

    function updateNeighbor(visitedItem: QueueItem, neighborX: number, neighborY: number) {
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

    let backtrackItem: QueueItem | null = null;
    while (queue.length > 0) {
        const visitedItem = queue.shift() as QueueItem;
        const {cell} = visitedItem;

        if (cell.equals(target)) {
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

export function computePath(unit: NotNull<PlayerUnit, "cell">, board: Board, target: Cell): Path | null {

    if (unit.cell.equals(target)) {
        return {
            steps: [target],
            cost: 0,
        };
    }

    let backtrackItem = findPathWithAStar(unit, board, target);

    if (backtrackItem === null) {
        return null;
    }

    const steps: Array<Cell> = [];
    let cost = 0;
    while (backtrackItem !== null) {
        steps.push(backtrackItem.cell);
        cost += backtrackItem.cost;
        backtrackItem = backtrackItem.predecessor;
    }
    steps.reverse();
    return {steps, cost};
}

export class ActionManager {

    constructor(protected adventure: Adventure) {}

    getDefaultInteraction(cell: Cell): Action|null {
        const activeUnit = this.adventure.activeUnit;

        const target = cell.unit;

        if (
            activeUnit === null
            || activeUnit === target
            || !this.canAct(activeUnit)
            || activeUnit.cell === null
            || !activeUnit.isAlive
        ) {
            return null;
        }

        if (target === null) {
            // can reach?
            const path = computePath(activeUnit as NotNull<PlayerUnit, "cell">, this.adventure.board, cell);
            if (path === null || path.cost > activeUnit.remainingMovePoints) {
                return null;
            }
            return ActionManager.asAction(
                ActionType.MOVE,
                action(() => {
                    activeUnit.cell = cell;
                    activeUnit.spentMovePoints(path.cost);
                })
            );
        }

        if (
            activeUnit.player !== target.player
            && target.isAlive
            && activeUnit.canAttack(target)
        ) {
            return ActionManager.asAction(
                ActionType.ATTACK, () => {
                    target.dealDamage(1);
                    activeUnit.exhausted = true;
                    this.adventure.endTurn();
                });
        }

        return null;
    }

    canAct(unit: PlayerUnit) {
        return unit === this.adventure.activeUnit
            && unit.isAlive
        ;
    }

    static asAction(type: ActionType, run: () => void): Action {
        return {
            type,
            run,
        }
    }
}