import {Cell} from "../model/board";
import {Adventure} from "../model/Adventure";
import {NotNull} from "../helpers";
import {IngameUnit, PlacedUnit} from "../model/IngameUnit";
import {Path} from "../service/pathfinder";

export * from './ActionManager';

export interface AbilityType {
    name: string,
    isMove?: boolean,
    isAttack?: boolean,
    isStandard?: boolean,
}

export interface Action {
    type: AbilityType,
}
interface MigratingAction extends Action {
    apply(): void,
}

interface MoveData {
    target: Cell,
    path: Path,
}
export interface MoveAction extends Action {
    actor: IngameUnit,
    moveData: MoveData,
}
interface AttackData {
    target: IngameUnit,
    staminaCost: number,
    healthDmg: number,
    staminaDmg: number,
}
export interface AttackAction extends Action {
    actor: IngameUnit,
    attackData: AttackData,
}
export type DomainAction = MoveAction | AttackAction | MigratingAction;

export interface IngameAbility {
    type: AbilityType,
    apply(cell: Cell): DomainAction | null
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

export function contextAgnostic(ability: IngameAbility) {
    return ({
        type: ability.type,
        apply: () => ability
    })
}