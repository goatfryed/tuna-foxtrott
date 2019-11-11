import {Cell, PlayerUnit} from "./model";
import {Adventure} from "./model/Adventure";

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