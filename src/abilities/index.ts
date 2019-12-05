import {Cell} from "../model/board";
import {PlacedUnit} from "../model/IngameUnit";
import {NotNull} from "../helpers";
import {Adventure} from "../model/Adventure";

export interface AbilityType {
    name: string,
}

export interface AbilityUse {
    apply: () => void,
}

export interface IngameAbility {
    apply: (cell: Cell) => AbilityUse|null
}

export interface AbilityContext {
    adventure: Adventure
}

export interface AbilityDeclaration<T extends PlacedUnit = PlacedUnit> {
    apply: (unit: T, context: AbilityContext) => IngameAbility|null
}

export interface Typed<I, T = AbilityType> {
    type: T,
    implementation: I,
}

export type Attackable = NotNull<Cell, "unit">