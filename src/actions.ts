import {Cell, PlayerUnit} from "./model";
import {Adventure} from "./model/Adventure";

/**
 * business logic should be tied to the model
 * All actions here should just be callback creators
 * to delay execution of that business logic and bind arguments
 *
 * TODO: figure out, how to create Callables that could be checked with instanceof, or add type property, to identify a callback as an action
 */

export function selectAction(adventure: Adventure, unit: PlayerUnit) {
    return () => adventure.activeUnit = unit;
}

export function moveAction(activeUnit: PlayerUnit, cell: Cell) {
    return () => activeUnit.cell = cell
}

// noinspection JSUnusedLocalSymbols
export function attackAction(activeUnit: PlayerUnit, unit: PlayerUnit) {
    return () => alert("B#m")
}

export function unselectAction(adventure: Adventure) {
    return () => adventure.activeUnit = null;
}