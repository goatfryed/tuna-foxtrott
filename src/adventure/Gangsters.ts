import {createUnitDefinition} from "../model/UnitImpl";

export const BullyDefinition = createUnitDefinition({
    baseHealth: 11,
    initiativeDelay: 90,
    abilities: [],
});
export const ThugDefinition = createUnitDefinition({
    baseHealth: 9
});