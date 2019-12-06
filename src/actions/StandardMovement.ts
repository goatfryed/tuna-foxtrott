import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {AbilityContext, AbilityDeclaration, AbilityUse} from "./index";
import {computePath} from "../service/pathfinder";

export const StandardMoveType = {
    name: "move",
    isMove: true,
} as const;

export const StandardMovement: AbilityDeclaration = {
    type: StandardMoveType,
    apply: (unit: PlacedUnit) => ({
        type: StandardMoveType,
        apply: context => ({
            type: StandardMoveType,
            apply: (cell: Cell): AbilityUse | null => prepareStandardMove(unit, cell, context)
        })
    })
};

function prepareStandardMove(unit: PlacedUnit, cell: Cell, context: AbilityContext): AbilityUse | null {
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
        apply: () => {
            // @TODO why is cell assumed const or readonly in PlacedUnit?
            unit.cell = cell;
            unit.spentMovePoints(path.cost);
        }
    }
}