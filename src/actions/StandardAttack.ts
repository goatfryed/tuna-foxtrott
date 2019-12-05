import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {AbilityDeclaration, AbilityUse, Attackable, Typed} from "./index";

export const StandardAttack: Typed<AbilityDeclaration> = {
    type: {
        name: "attack"
    } as const,
    implementation: {
        apply: unit => ({
            apply: cell => prepareStandardAttack(unit, cell)
        })
    }
};

function canStandardAttack(actor: PlacedUnit, target: Cell): target is Attackable {
    return target.unit !== null
        && !actor.exhausted
        && actor.cell.isNeighbor(target)
        && actor.player !== target.unit.player
        && target.unit.isAlive
}

function prepareStandardAttack(unit: PlacedUnit, cell: Cell): AbilityUse | null {
    if (!canStandardAttack(unit, cell)) {
        return null;
    }
    return {
        apply: () => {
            cell.unit.dealDamage(1);
            unit.exhausted = true;
        }
    }
}

