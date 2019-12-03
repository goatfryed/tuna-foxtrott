import {UnitDefinition} from "../model/UnitImpl";

export const Definitions = {
    AXEL: {
        baseHealth: 5,
        initiativeDelay: 80,
        baseSpeed: 3,
    },
    BOWER: {
        baseHealth: 4,
        initiativeDelay: 100,
        baseSpeed: 2,
        specials: [
            {
                name: "Clap",
                execute: () => alert("clap! clap!")
            }
        ] as any[]
    },
    MACEL: {
        baseHealth: 6,
        initiativeDelay: 105,
        baseSpeed: 3,
    },
    CLUBBER: {
        baseHealth: 4,
        initiativeDelay: 80,
        baseSpeed: 4,
    },
} as const;

// config validation
// noinspection BadExpressionStatementJS
false as true && Definitions as {[k in string]: UnitDefinition};