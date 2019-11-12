import {Cell, PlayerUnit} from "./model";
import {Adventure} from "./model/Adventure";

/**
 * business logic should be tied to the model
 * All actions here should just be callback creators
 * to delay execution of that business logic and bind arguments
 *
 * Please be aware, that ActionCreator and Action type are inferred from all exports of this file.
 * Therefore
 */

export interface Action<R = any,T extends string = string> {
    run(): R,
    type: T;
}

function asAction<V,T extends string>(run: () => V, type:T): Action<V,T> {
    return {
        run,
        type
    }
}

export function selectAction(adventure: Adventure, unit: PlayerUnit) {
    return asAction(() => adventure.activeUnit = unit,"SELECT" as const);
}

export function moveAction(activeUnit: PlayerUnit, cell: Cell) {
    return asAction(() => activeUnit.cell = cell, "MOVE");
}

// noinspection JSUnusedLocalSymbols
export function attackAction(activeUnit: PlayerUnit, unit: PlayerUnit) {
    return asAction(() => alert("B#m"), "ATTACK");
}

export function unselectAction(adventure: Adventure) {
    return asAction(() => adventure.activeUnit = null, "UNSELECT");
}