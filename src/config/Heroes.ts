import {UnitDefinition} from "../model/UnitImpl";
import {HeavyStrike} from "./Attacks";
import {AbilityDeclaration} from "../actions";

export const Definitions = {
    AXEL: {
        baseHealth: 5,
        initiativeDelay: 80,
        baseSpeed: 3,
        abilities: [
            HeavyStrike,
        ] as AbilityDeclaration[]
    },
    BOWER: {
        baseHealth: 4,
        initiativeDelay: 100,
        baseSpeed: 2,
        abilities: [] as AbilityDeclaration[]
    },
    MACEL: {
        baseHealth: 6,
        initiativeDelay: 105,
        baseSpeed: 3,
        abilities: [] as AbilityDeclaration[]
    },
    CLUBBER: {
        baseHealth: 4,
        initiativeDelay: 80,
        baseSpeed: 4,
        abilities: [] as AbilityDeclaration[]
    },
} as const;

// config validation
// noinspection BadExpressionStatementJS
false as true && Definitions as {[k in string]: UnitDefinition};