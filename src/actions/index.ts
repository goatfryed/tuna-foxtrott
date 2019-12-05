import {Cell} from "../model/board";
import {Adventure} from "../model/Adventure";
import {NotNull} from "../helpers";
import {PlacedUnit} from "../model/IngameUnit";

export * from './ActionManager';

export interface AbilityType {
    name: string,
    isMove?: boolean,
    isAttack?: boolean,

}

export interface AbilityUse {
    apply(): void,
}

export interface IngameAbility {
    apply(cell: Cell): AbilityUse | null
}

export interface AbilityContext {
    adventure: Adventure
}

export interface AbilityDeclaration<T extends PlacedUnit = PlacedUnit> {
    apply(unit: T, context: AbilityContext): IngameAbility | null
}

export interface Typed<I, T = AbilityType> {
    type: T,
    implementation: I,
}

export type Attackable = NotNull<Cell, "unit">

export interface Action {
    use: AbilityUse,
    type: AbilityType;
}

export interface InteractionRequest {
    cell: Cell,
}

export interface InteractionIntent {
    name: string,
    execute: () => void,
}