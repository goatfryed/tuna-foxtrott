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
    type: AbilityType,
    apply(): void,
}

export interface IngameAbility {
    type: AbilityType,
    apply(cell: Cell): AbilityUse | null
}

export interface BoundAbility {
    type: AbilityType,
    apply(context: AbilityContext): IngameAbility | null
}

export interface AbilityContext {
    adventure: Adventure
}

export interface AbilityDeclaration<T extends PlacedUnit = PlacedUnit> {
    type: AbilityType,
    apply(unit: T): BoundAbility | null
}

export type Attackable = NotNull<Cell, "unit">

export interface Action {
    use: AbilityUse,
    type: AbilityType;
}

export interface InteractionRequest {
    cell: Cell,
}

export function contextAgnostic(ability: IngameAbility) {
    return ({
        type: ability.type,
        apply: () => ability
    })
}