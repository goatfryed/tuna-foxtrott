import {SpecialAbility, UnitDefinition} from "../model/UnitImpl";
import {PlacedUnit} from "../model/IngameUnit";
import {Cell} from "../model/board";

export const Definitions = {
    AXEL: {
        baseHealth: 5,
        initiativeDelay: 80,
        baseSpeed: 3,
        specials: [
            {
                name: "Heavy Strike",
                actionFactory(unit: PlacedUnit, cell: Cell) {
                    const target = cell.unit;
                    if (!cell.isNeighbor(unit.cell)
                        || target === null
                        || unit.exhausted
                    ) {
                        return null;
                    }
                    return () => {
                        unit.exhausted = true;
                        target.dealDamage(2);
                    }
                }
            }
        ] as SpecialAbility[]
    },
    BOWER: {
        baseHealth: 4,
        initiativeDelay: 100,
        baseSpeed: 2,
        specials: [
            {
                name: "Clap",
                actionFactory: () => (() => alert("clap! clap!"))
            }
        ] as SpecialAbility[]
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