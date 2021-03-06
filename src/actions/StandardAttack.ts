import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {Attackable, AttackAction, AttackType, composeAbility} from "./index";

const StandardAttackType: AttackType = {
    name: "attack",
    type: "ATTACK",
    isStandard: true,
    staminaCost: 1,
    healthDmg: 2,
    staminaDmg: 0,
} as const;

export const StandardAttack = composeAbility(
    StandardAttackType,
    unit => () => cell => prepareStandardAttack(unit, cell)
);

export function isStandardTarget(unit: PlacedUnit, target: Cell): target is Attackable {
    return target.unit !== null
        && !unit.mainActionUsed
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

function prepareStandardAttack(unit: PlacedUnit, cell: Cell): AttackAction | null {
    if (!isStandardTarget(unit, cell)) {
        return null;
    }
    if (unit.baseRange === undefined && !isMelee(unit, cell)) {
        return null;
    }
    if (unit.baseRange !== undefined && !isInRange(unit, cell, unit.baseRange)) {
        return null;
    }

    return {
        type: StandardAttackType.type,
        descriptor: StandardAttackType,
        actor: unit,
        target: cell.unit,
    }
}

