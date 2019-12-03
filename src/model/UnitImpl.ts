export interface UnitDefinition {
    readonly baseHealth: number;
    readonly baseSpeed: number;
    readonly initiativeDelay: number;
    readonly specials?: SpecialAbility[];
}

export interface SpecialAbility {
    name: string,
    execute: () => void,
}

export interface Unit extends UnitDefinition {
    readonly name: string;
    readonly id: number;
    readonly specials: any[];
}

const unitDefaults = {
    baseSpeed: 3,
    initiativeDelay: 100,
} as const;

export function createUnitDefinition(
    definition: Partial<UnitDefinition> & Omit<UnitDefinition, keyof typeof unitDefaults>
): UnitDefinition {
    return {
        ...unitDefaults,
        ...definition,
    };
}

export class UnitImpl implements Unit {

    private static counter: number = 0;
    readonly id: number;

    constructor(
        readonly name: string,
        readonly definition: UnitDefinition,
        id?: number,
    ) {
        this.id = id !== undefined ? id : UnitImpl.counter++;
    }

    toString() {
        return `${this.name}`;
    }

    get specials() {return this.definition.specials ?? [];}

    get baseHealth() {return this.definition.baseHealth};
    get baseSpeed() {return this.definition.baseSpeed};
    get initiativeDelay() {return this.definition.initiativeDelay};
}

