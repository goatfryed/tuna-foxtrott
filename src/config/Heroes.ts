import {UnitDefinition} from "../model/UnitImpl";
import {DeadlyShot, HeavyStrike} from "./Attacks";
import {AbilityDeclaration} from "../actions";
import {StandardAttack} from "../actions/StandardAttack";
import {StandardMovement} from "../actions/StandardMovement";

export const HeroDefinitions = {
    AXEL: {
        baseHealth: 10,
        initiativeDelay: 80,
        baseSpeed: 3,
        staminaRegeneration: 1,
        abilities: withStandards([
            HeavyStrike,
        ]) as AbilityDeclaration[]
    },
    BOWER: {
        baseHealth: 8,
        initiativeDelay: 100,
        baseSpeed: 2,
        staminaRegeneration: 1,
        abilities: withStandards([
            DeadlyShot,
        ]) as AbilityDeclaration[]
    },
    MACEL: {
        baseHealth: 12,
        initiativeDelay: 105,
        baseSpeed: 3,
        staminaRegeneration: 1,
        abilities: withStandards([
            HeavyStrike,
        ]) as AbilityDeclaration[]
    },
    CLUBBER: {
        baseHealth: 8,
        initiativeDelay: 80,
        baseSpeed: 4,
        staminaRegeneration: 1,
        abilities: withStandards([
            HeavyStrike,
        ]) as AbilityDeclaration[]
    },
} as const;

function withStandards(abilities: AbilityDeclaration[]): AbilityDeclaration[] {
    return [
        StandardMovement,
        StandardAttack,
        ...abilities,
    ];
}

// config validation
// noinspection BadExpressionStatementJS
false as true && HeroDefinitions as {[k in string]: UnitDefinition};