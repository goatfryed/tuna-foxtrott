import {
    AttackAction,
    AttackType,
    composeAbility
} from "../actions";
import {isMeleeTarget, isRangedTarget} from "../actions/StandardAttack";

const HeavyStrikeType: AttackType = {
    type: "ATTACK",
    name: "Heavy strike",
    staminaCost: 4,
    healthDmg: 5,
    staminaDmg: 2,
} as const;

export const HeavyStrike = composeAbility<AttackAction>(
    HeavyStrikeType,
    unit => () => cell => {
    if (!isMeleeTarget(unit, cell)) {
        return null;
    }
    return {
        type: HeavyStrikeType.type,
        descriptor: HeavyStrikeType,
        actor: unit,
        target: cell.unit,
    }
});

const DeadlyShotType = {
    type: "MIGRATE",
    name: "Deadly shot",
    range: 4,
    executeRange: 8,
} as const;

export const DeadlyShot = composeAbility(
    DeadlyShotType,
    unit => () => cell => {
    if (!isRangedTarget(unit, cell, DeadlyShotType.range)) {
        return null;
    }

    if (cell.unit.stamina > DeadlyShotType.executeRange) {
        return null;
    }

    return {
        type: DeadlyShotType.type,
        descriptor: DeadlyShotType,
        actor: unit,
        apply(): void {
            cell.unit.dealHealthDamage(cell.unit.currentHealth);
            unit.updateStamina(-3);
            unit.mainActionUsed = true;
        }
    }
});


