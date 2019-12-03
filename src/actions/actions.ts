import {Adventure} from "../model/Adventure";
import {action, observable} from "mobx";
import {NotNull} from "../helpers";
import {Board, Cell} from "../model/board";
import {IngameUnit, PlacedUnit} from "../model/IngameUnit";

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

interface PathItem {
    cell: Cell,
    predecessor: PathItem|null,
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
    unit: NotNull<IngameUnit, "cell">,
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

interface InteractionRequest {
    cell: Cell,
}

interface InteractionIntent {
    name: string,
    execute: () => void,
}

export class ActionManager {

    constructor(protected adventure: Adventure) {}

    @observable interactionRequest: InteractionRequest|null = null;

    get interactionIntents(): InteractionIntent[] {
        if (this.interactionRequest === null) return [];
        return this.adventure.activeUnit?.specials ?? [];
    }

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

        let interaction: Action|null = null;
        if (target === null) {
            interaction = this.moveActionOrNull(activeUnit, cell)
        }

        if (
            interaction === null
            && target !== null
            && activeUnit.player !== target.player
            && target.isAlive
        ) {
            interaction = this.attackActionOrNull(activeUnit, target);
        }

        return interaction;
    }

    moveActionOrNull(unit: IngameUnit, cell: Cell) {
        // can reach?
        const path = computePath(this.adventure.board, unit as NotNull<IngameUnit, "cell">, cell);
        if (path === null || path.cost > unit.remainingMovePoints) {
            return null;
        }
        return this.doMoveAction(unit, path);
    }

    doMoveAction(unit: IngameUnit, path: Path) {
        return ActionManager.asAction(
            ActionType.MOVE,
            action(() => {
                unit.cell = path.steps[path.steps.length - 1].cell;
                unit.spentMovePoints(path.cost);
            })
        );
    }

    attackActionOrNull(unit: IngameUnit, target: IngameUnit) {
        if (unit.canAttack(target)) {
            return ActionManager.asAction(
                ActionType.ATTACK,
                action(() => {
                    target.dealDamage(1);
                    unit.exhausted = true;
                    this.adventure.endTurn();
                })
            );
        }
        return null;
    }

    canAct(unit: IngameUnit): unit is NotNull<IngameUnit, "cell"> {
        return unit === this.adventure.activeUnit
            && unit.cell !== null
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