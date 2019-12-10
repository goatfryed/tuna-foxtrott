import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {AbilityContext, AbilityDeclaration, DomainAction} from "./index";
import {computePath} from "../service/pathfinder";

export const StandardMoveType = {
    name: "move",
    isMove: true,
    isStandard: true,
} as const;

export const StandardMovement: AbilityDeclaration = {
    type: StandardMoveType,
    apply: (unit: PlacedUnit) => ({
        type: StandardMoveType,
        apply: context => ({
            type: StandardMoveType,
            apply: (cell: Cell): DomainAction | null => prepareStandardMove(unit, cell, context)
        })
    })
};

function prepareStandardMove(unit: PlacedUnit, cell: Cell, context: AbilityContext): DomainAction | null {
    // can reach?
    if (cell.unit !== null) {
        return null;
    }
    const path = computePath(context.adventure.board, unit, cell);
    if (path === null || path.cost > unit.remainingMovePoints) {
        return null;
    }

    return {
        type: StandardMoveType,
        actor: unit,
        moveData: {
            target: cell,
            path,
        }
    }
}