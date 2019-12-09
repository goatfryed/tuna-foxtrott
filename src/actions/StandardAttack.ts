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

export function isStandardTarget(unit: PlacedUnit, target: Cell): target is Attackable {
    return target.unit !== null
        && !unit.mainActionUsed
        && unit.cell.isNeighbor(target)
        && unit.player !== target.unit.player
        && target.unit.isCombatReady
}

function isMelee(unit: PlacedUnit, target: Cell) {
    return unit.cell.isNeighbor(target)
}

function isInRange(unit: PlacedUnit, target: Cell, range: number) {
    return unit.cell.getManhattenDistance(target) <= range;

}
export function isMeleeTarget(unit: PlacedUnit, target: Cell): target is Attackable {
    return isStandardTarget(unit, target) && isMelee(unit, target);

}
export function isRangedTarget(unit: PlacedUnit, target: Cell, range: number): target is Attackable {
    return isStandardTarget(unit, target) && isInRange(unit, target, range);
}

function prepareStandardAttack(unit: PlacedUnit, cell: Cell): AbilityUse | null {
    if (!isMeleeTarget(unit, cell)) {
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

