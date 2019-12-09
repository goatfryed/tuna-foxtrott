import {AbilityDeclaration, AbilityUse, BoundAbility, contextAgnostic} from "../actions";
import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";
import {isMeleeTarget, isRangedTarget} from "../actions/StandardAttack";

const HeavyStrikeType = {
    name: "Heavy strike",
    isAttack: true,
    isMove: false,
} as const;

export const HeavyStrike: AbilityDeclaration = {
    type: HeavyStrikeType,
    apply: (unit: PlacedUnit): BoundAbility | null => contextAgnostic({
        type: HeavyStrikeType,
        apply(cell: Cell): AbilityUse | null {
            if (!isMeleeTarget(unit, cell)) {
                return null;
            }

            return {
                type: HeavyStrikeType,
                apply(): void {
                    cell.unit.dealHealthDamage(5);
                    unit.updateStamina(-4);
                    unit.mainActionUsed = true;
                }
            }
        }
    })
} as const;

const DeadlyShotType = {
    name: "Deadly shot",
    range: 4,
    executeRange: 8,
    isAttack: true,
};

export const DeadlyShot: AbilityDeclaration = {
    type: DeadlyShotType,
    apply: (unit: PlacedUnit): BoundAbility | null => contextAgnostic({
        type: DeadlyShotType,
        apply(cell: Cell): AbilityUse | null {
            if (!isRangedTarget(unit, cell, DeadlyShotType.range)) {
                return null;
            }

            if (cell.unit.stamina > DeadlyShotType.executeRange) {
                return null;
            }

            return {
                type: DeadlyShotType,
                apply(): void {
                    cell.unit.dealHealthDamage(cell.unit.currentHealth);
                    unit.updateStamina(-3);
                    unit.mainActionUsed = true;
                }
            }
        }
    })

};