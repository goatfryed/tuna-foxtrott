import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {AbilityDeclaration, AbilityUse, Attackable, contextAgnostic} from "./index";

const StandardAttackType = {
    name: "attack",
    isAttack: true,
} as const;

export const StandardAttack: AbilityDeclaration = {
    type: StandardAttackType,
    apply: unit => contextAgnostic({
        type: StandardAttackType,
        apply: cell => prepareStandardAttack(unit, cell)
    })
};

export function canStandardAttack(actor: PlacedUnit, target: Cell): target is Attackable {
    return target.unit !== null
        && !actor.mainActionUsed
        && actor.cell.isNeighbor(target)
        && actor.player !== target.unit.player
        && target.unit.isCombatReady
}

function prepareStandardAttack(unit: PlacedUnit, cell: Cell): AbilityUse | null {
    if (!canStandardAttack(unit, cell)) {
        return null;
    }
    return {
        type: StandardAttackType,
        apply: () => {
            cell.unit.dealHealthDamage(3);
            unit.updateStamina(-2);
            unit.mainActionUsed = true;
        }
    }
}

