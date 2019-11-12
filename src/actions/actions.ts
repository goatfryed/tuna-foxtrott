import {Cell, PlayerUnit} from "../model";
import {Adventure} from "../model/Adventure";

/**
 * business logic should be tied to the model
 * All actions here should just be callback creators
 * to delay execution of that business logic and bind arguments
 *
 * Please be aware, that ActionCreator and Action type are inferred from all exports of this file.
 * Therefore
 */

export enum ActionType {
    SELECT,
    MOVE,
    ATTACK,
    UNSELECT,
}

export interface Action {
    run(): void,
    type: ActionType;
}

function asAction(run: () => void, type: ActionType): Action {
    return {
        run,
        type
    }
}

export function selectAction(adventure: Adventure, unit: PlayerUnit) {
    return asAction(() => adventure.activeUnit = unit,ActionType.SELECT);
}

export function moveAction(activeUnit: PlayerUnit, cell: Cell) {
    return asAction(() => activeUnit.cell = cell, ActionType.MOVE);
}

// noinspection JSUnusedLocalSymbols
export function attackAction(activeUnit: PlayerUnit, unit: PlayerUnit) {
    return asAction(() => alert("B#m"), ActionType.ATTACK);
}

export function unselectAction(adventure: Adventure) {
    return asAction(() => adventure.activeUnit = null, ActionType.UNSELECT);
}