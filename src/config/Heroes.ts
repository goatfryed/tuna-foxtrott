import {UnitDefinition} from "../model/UnitImpl";
import {DeadlyShot, HeavyStrike} from "./Attacks";
import {DomainAbility} from "../actions";
import {StandardAttack} from "../actions/StandardAttack";
import {StandardMovement} from "../actions/StandardMovement";

export const HeroDefinitions = {
    AXEL: {
        baseHealth: 10,
        initiativeDelay: 85,
        baseSpeed: 3,
        staminaRegeneration: 1,
        abilities: withStandards([
            HeavyStrike,
        ]) as DomainAbility[]
    },
    BOWER: {
        baseHealth: 7,
        initiativeDelay: 80,
        baseSpeed: 2,
        baseRange: 3,
        staminaRegeneration: 1,
        abilities: withStandards([
            DeadlyShot,
        ]) as DomainAbility[]
    },
    MACEL: {
        baseHealth: 12,
        initiativeDelay: 105,
        baseSpeed: 3,
        staminaRegeneration: 1,
        abilities: withStandards([
            HeavyStrike,
        ]) as DomainAbility[]
    },
    CLUBBER: {
        baseHealth: 8,
        initiativeDelay: 85,
        baseSpeed: 4,
        staminaRegeneration: 1,
        abilities: withStandards([
            HeavyStrike,
        ]) as DomainAbility[]
    },
} as const;

function withStandards(abilities: DomainAbility[]): DomainAbility[] {
    return [
        StandardMovement,
        StandardAttack,
        ...abilities,
    ];
}

// config validation
// noinspection BadExpressionStatementJS
false as true && HeroDefinitions as {[k in string]: UnitDefinition};