import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {AbilityDeclaration, composeAbility, MoveAction} from "./index";
import {computePath} from "../service/pathfinder";
import {Adventure} from "../model/Adventure";

export const StandardMoveType = {
    name: "move",
    type: "MOVE",
    isStandard: true,
} as const;

export const StandardMovement: AbilityDeclaration<MoveAction> = composeAbility(
    StandardMoveType,
    unit => adventure => cell => prepareStandardMove(unit, cell, adventure)
);

function prepareStandardMove(unit: PlacedUnit, cell: Cell, adventure: Adventure) {
    // can reach?
    if (cell.unit !== null) {
        return null;
    }
    const path = computePath(adventure.board, unit, cell);
    if (path === null || path.cost > unit.remainingMovePoints) {
        return null;
    }

    return {
        type: StandardMoveType.type,
        descriptor: StandardMoveType,
        actor: unit,
        target: cell,
        path,
    }
}