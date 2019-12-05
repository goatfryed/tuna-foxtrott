import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {AbilityContext, AbilityDeclaration, AbilityUse, Typed} from "./index";
import {computePath} from "../service/pathfinder";

export const StandardMovement: Typed<AbilityDeclaration> = {
    type: {
        name: "move"
    } as const,
    implementation: {
        apply: (unit: PlacedUnit, context) => ({
            apply: cell => prepareStandardMove(unit, cell, context)
        })
    }
};

function prepareStandardMove(unit: PlacedUnit, cell: Cell, context: AbilityContext): AbilityUse | null {
    // can reach?
    const path = computePath(context.adventure.board, unit, cell);
    if (path === null || path.cost > unit.remainingMovePoints) {
        return null;
    }

    return {
        apply: () => {
            // @TODO why is cell assumed const or readonly in PlacedUnit?
            unit.cell = cell;
            unit.spentMovePoints(path.cost);
        }
    }
}