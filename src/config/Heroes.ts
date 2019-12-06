import {UnitDefinition} from "../model/UnitImpl";
import {HeavyStrike} from "./Attacks";
import {AbilityDeclaration} from "../actions";

export const HeroDefinitions = {
    AXEL: {
        baseHealth: 10,
        initiativeDelay: 80,
        baseSpeed: 3,
        staminaRegeneration: 1,
        abilities: [
            HeavyStrike,
        ] as AbilityDeclaration[]
    },
    BOWER: {
        baseHealth: 8,
        initiativeDelay: 100,
        baseSpeed: 2,
        staminaRegeneration: 1,
        abilities: [] as AbilityDeclaration[]
    },
    MACEL: {
        baseHealth: 12,
        initiativeDelay: 105,
        baseSpeed: 3,
        staminaRegeneration: 1,
        abilities: [] as AbilityDeclaration[]
    },
    CLUBBER: {
        baseHealth: 8,
        initiativeDelay: 80,
        baseSpeed: 4,
        staminaRegeneration: 1,
        abilities: [] as AbilityDeclaration[]
    },
} as const;

// config validation
// noinspection BadExpressionStatementJS
false as true && HeroDefinitions as {[k in string]: UnitDefinition};