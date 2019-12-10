import {AbilityDeclaration} from "../actions";

export interface UnitBaseValues {
    readonly baseHealth: number;
    readonly baseSpeed: number;
    readonly baseRange?: number;
    readonly staminaRegeneration: number,
    readonly initiativeDelay: number;
}

export interface UnitDefinition extends UnitBaseValues {
    readonly abilities: AbilityDeclaration[];
}

export interface Unit extends UnitBaseValues {
    readonly name: string;
    readonly id: number;
}

const unitDefaults: UnitDefinition = {
    baseHealth: 10,
    staminaRegeneration: 1,
    baseSpeed: 3,
    initiativeDelay: 100,
    abilities: [] as AbilityDeclaration[],
};

export function createUnitDefinition(
    definition: Partial<UnitDefinition>
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

    get baseRange() {return this.definition.baseRange}
    get abilities() {return this.definition.abilities;}
    get baseHealth() {return this.definition.baseHealth};
    get baseSpeed() {return this.definition.baseSpeed};
    get initiativeDelay() {return this.definition.initiativeDelay};
    get staminaRegeneration() {return this.definition.staminaRegeneration;}
}

