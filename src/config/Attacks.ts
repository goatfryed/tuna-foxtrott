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
    type: "ATTACK",
    name: "Deadly shot",
    staminaDmg: 0,
    healthDmg: 999,
    staminaCost: 4,
    range: 4,
    maxHPpercent: 0.5,
} as const;

export const DeadlyShot = composeAbility<AttackAction>(
    DeadlyShotType,
    unit => () => cell => {
    if (!isRangedTarget(unit, cell, DeadlyShotType.range)) {
        return null;
    }

    if (cell.unit.currentHealth / cell.unit.maxHealth > DeadlyShotType.maxHPpercent) {
        return null;
    }

    return {
        type: DeadlyShotType.type,
        descriptor: DeadlyShotType,
        actor: cell.unit,
        target: unit,
    }
});


